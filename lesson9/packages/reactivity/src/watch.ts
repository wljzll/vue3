import { isFunction, isObject } from "@vue/shared";
import { isReactive, ReactiveEffect } from "@vue/reactivity";




function traverse(value, seen = new Set()) {
    if (!isObject(value)) {
        return;
    }

    if (seen.has(value)) {
        return value;
    }

    seen.add(value);

    for (const key in value) {
        traverse(value[key], seen)
    }
    return value;
}



export default function watch(source, cb, { immediate } = {} as any) {

    let getter;
    if (isReactive(getter)) {
        // 这里是不是只有当deep=true的时候才需要深度遍历？
        getter = () => traverse(getter);
    } else if (isFunction(source)) {
        getter = source;
    }

    let oldValue;

    // 创建自定义渲染函数 每次watch重新触发执行都会执行job函数
    const job = () => {
        // 依赖数据有变化会触发job执行 执行effect.run 就是执行getter函数 获取新值
        const newValue = effect.run();
        // 调用回调函数将最新的值和上一次的老值分别传入
        cb(newValue, oldValue);
        // 这一次的新值成为了老值
        oldValue = newValue;

    }

    // 创建effect对象
    const effect = new ReactiveEffect(getter, job);
    // 如果是立即执行 立即调用一次job函数也就是执行一次cb
    if (immediate) {
        job();
    }
    // 执行一次run方法 获取一次老值
    oldValue = effect.run();

}