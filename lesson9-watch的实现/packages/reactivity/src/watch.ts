import { isFunction, isObject } from "@vue/shared";
import { isReactive, ReactiveEffect } from "@vue/reactivity";

let cleanup;
// 传给用户的方法
let onCleanup = (fn) => {
  cleanup = fn;
};

// deep: true时递归对象 性能不好
function traverse(value, seen = new Set()) {
  if (!isObject(value)) {
    return;
  }

  if (seen.has(value)) {
    return value;
  }

  seen.add(value);

  for (const key in value) {
    traverse(value[key], seen);
  }
  return value;
}

function doWatch(source, cb, { immediate } = {} as any) {
  let getter;
  if (isReactive(source)) {
    // 这里是不是只有当deep=true的时候才需要深度遍历？
    getter = () => traverse(source);
  } else if (isFunction(source)) {
    getter = source;
  }

  let oldValue;

  // 创建自定义渲染函数 每次watch重新触发执行都会执行job函数
  const job = () => {
    if (cb) {
      // 依赖数据有变化会触发job执行 执行effect.run 就是执行getter函数 获取新值
      const newValue = effect.run();
      if (cleanup) cleanup(); // 下次调用之前先执行上一次的cleanup
      // 调用回调函数将最新的值和上一次的老值分别传入
      cb(newValue, oldValue, onCleanup);
      // 这一次的新值成为了老值
      oldValue = newValue;
    } else {
      effect.run();
    }
  };

  // 创建effect对象
  const effect = new ReactiveEffect(getter, job);
  // 如果是立即执行 立即调用一次job函数也就是执行一次cb
  if (immediate) {
    job();
  }
  // 执行一次run方法 触发getter执行 触发依赖收集watch的effect 获取一次老值
  oldValue = effect.run();
}

export function watch(source, cb, options) {
  doWatch(source, cb, options);
}

export function watchEffect(effect, options) {
  doWatch(effect, null, options);
}
