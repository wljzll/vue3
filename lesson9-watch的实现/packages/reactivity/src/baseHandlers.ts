import { reactive, ReactiveFlags } from "@vue/reactivity";
import { isObject } from "@vue/shared";
import { track, trigger } from "./effect";

export const mutableHandlers = {
  // 劫持用户取值操作
  get(target, key, receiver) {
    // 用户获取ReactiveFlags.IS_REACTIVE 来判断是否是响应式 直接返回true
    if (key == ReactiveFlags.IS_REACTIVE) {
      return true;
    }
    const res = Reflect.get(target, key, receiver);
    console.log(res);
    
    // 依赖收集
    track(target, "get", key);

    // 当用户获取响应式对象中的对象再去代理 实现懒代理 节省性能
    if (isObject(res)) {
      return reactive(res);
    }
    return res;
  },

  // 劫持用户赋值操作
  set(target, key, value, receiver) {
    // 获取老值
    let oldValue = target[key];
    let r = Reflect.set(target, key, value, receiver);
    if (oldValue !== value) {
      trigger(target, key, value, oldValue);
    }
    return r;
  },
};
