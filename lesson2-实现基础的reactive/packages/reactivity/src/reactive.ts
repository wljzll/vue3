import { isObject } from "@vue/shared";
import { mutableHandlers } from "./baseHandlers";

export const enum ReactiveFlags {
    IS_REACTIVE = "__v_isReactive",
}

// 缓存代理过的对象: 1. 防止重复代理
const reactiveMap = new WeakMap(); // key 只能是对象
export function reactive(target) {
    // 不对非对象类型做处理
    if (!isObject(target)) {
        return target;
    }

    // 如果target已经被代理过不进行重复代理
    if (target[ReactiveFlags.IS_REACTIVE]) {
        return target;
    }

    // 看是否已缓存过
    const exisitsProxy = reactiveMap.get(target);
    
    // 如果缓存中有 直接返回 防止同一个对象多次代理
    if (exisitsProxy) {
        return exisitsProxy;
    }

    // 代理目标对象
    const proxy = new Proxy(target, mutableHandlers);

    // 缓存起来
    reactiveMap.set(target, proxy);

    return proxy;
}