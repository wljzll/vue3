export let activeEffect;


function cleanEffect(effect) {
    let { deps } = effect;
    for (let i = 0; i < deps.length; i++) {
        deps[i].delete(effect);
    }
    effect.deps.length = 0;
}

class ReactiveEffect {
    public active = true // 当前的effect是否是激活的 默认是激活的
    public deps = [] // 记录这个effect依赖的数据
    public parent = undefined // 当前effect的上一个激活的effect 这么做的目的是方便链式查找 还原上一次的activeEffect
    constructor(public fn, private scheduler) { }
    run() {
        // 如果当前的effect不是激活的 那么只执行fn这个参数函数即可
        if (!this.active) {
            return this.fn();
        }

        // 其他情况 说明这个effect是激活状态 不仅要执行fn还要做收集操作
        // try一下是防止用户传入到effect中的fn执行的时候报错
        try {
            // 在当前的effect的parent属性上记录当前激活中的effect
            this.parent = activeEffect;
            // 把当前激活中的effect换成自己
            activeEffect = this;
            // 每次重新执行effect之前 都去清空下这个effect收集的
            cleanEffect(this);
            // fn里会有对响应式数据取值的操作 取值就会进入到proxy的get代理中
            return this.fn();
        } finally { // finally是无论什么情况下都会走到这里
            // 执行完fn 当前的effect就不是正在激活的了 还原回上一次正在激活的effect
            activeEffect = this.parent;
            // 当前的effect的父亲也重置为undefined
            this.parent = undefined;
        }
    }
    stop() {
        if (this.active) {
            // 先将effect的依赖全部删除掉
            cleanEffect(this);
            // 再将effect置为失活
            this.active = false;
        }
    }
}

// 依赖收集就是将当前正在执行的effect变成全局的 稍后取值的时候就能够拿到这个全局的effect
export function effect(fn, options: any = {}) {
    const _effect = new ReactiveEffect(fn, options.scheduler);
    _effect.run(); // 默认让响应式的effect执行一次

    // 绑定this
    const runner = _effect.run.bind(_effect);
    // 在runner上添加一个effect属性 就是effect自己
    runner.effect = _effect;
    // 返回一个runner方法可以强制手动更新
    return runner;
}

// 存放依赖收集的映射表 weakMap中的key必须是对象
const targetMap = new WeakMap();
/**
 * 
 * @param target 目标对象
 * @param key 目标对象的key
 */
export function track(target, key) {
    // 说明取值操作不是在effect中取值的 就不需要收集了
    if (!activeEffect) {
        return;
    }
    // 从映射表中对target取值 看是否已存在
    let despMap = targetMap.get(target);
    // 未收集过依赖 给depsMap赋值一个新的Map
    if (!despMap) {
        targetMap.set(target, (despMap = new Map()));
    }
    // 这里target对应的键的依赖的Map可以存在也可能是空 对对应的key进行取值
    let dep = despMap.get(key);
    // 如果没有取到 给对应的key依赖的effect创建个Set
    if (!dep) {
        despMap.set(key, (dep = new Set()));
    }
    // 对key存放effect的Set取值 看当前的activeEffect是否已经收集过了
    let shouldTrack = !dep.has(activeEffect);
    // 如果没有收集过去收集
    if (shouldTrack) {
        // key去收集effect
        dep.add(activeEffect);
        // effect收集dep 这里是利用闭包的原理 拿到了key对应的set就行了 目的是可以清空
        activeEffect.deps.push(dep);
    }
}


export function trigger(target, key, newValue, oldValue) {
    // 从映射表中取出target的映射
    const despMap = targetMap.get(target);
    // 如果没有收集过依赖不需要触发更新
    if (!despMap) {
        return;
    }
    // 取对应的key的Set
    const dep = despMap.get(key);
    // 如果收集过依赖就去遍历Set依次执行effect.run 更新
    if (dep) {
        // 这里相当于复制一个出来
        const effects = [...dep];
        // 循环复制出来的数组 这个复制出来的数组不会被
        effects.forEach(effect => {
            // // 当我重新执行此effect时 会将当前执行的effect放到全局的activeEffect上
            // activeEffect = effect;
            // 如果正在执行的effect中有赋值操作又会触发执行 这里处理下不再执行 避免死循环
            if (activeEffect !== effect) {
                // 没有scheduler就执行run方法
                if (!effect.scheduler) {
                    effect.run();
                } else {
                    // 有scheduler就执行scheduler
                    effect.scheduler();
                }

            }
        })
    }
}

// 死循环怎么来的?
// 我们循环dep => 执行run方法 => 先去清空这个effect的deps中的自己 => 然后执行this.fn()
// dep又收集了这个effect => dep.forEach又会遍历到这个effect => 执行run方法 => 清理effect
// 执行this.fn() => dep又收集了effect 导致死循环
// 只要我们把dep拷贝一份出来去循环 就不会死循环了

// effect中定义parent的目的是为了处理effect嵌套的问题
// let activeEffect = e2;
// effect(() => { // e1 e1.parent = null
//     state.name; // e1
//     effect(() => { // e2 e2.parent = e1
//         state.age; // e2
//     })
//     state.address; // e1
// })