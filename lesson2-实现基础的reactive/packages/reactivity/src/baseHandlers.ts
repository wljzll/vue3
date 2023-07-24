import { ReactiveFlags } from "@vue/reactivity";

export const mutableHandlers = {
    // 劫持用户取值操作
    get(target, key, receiver) {
        if (key == ReactiveFlags.IS_REACTIVE) {
            return true;
        }
        // 使用Reflect是为了改变this指向 防止出现在方法里取值 this指向不对导致的未代理问题
        return Reflect.get(target, key, receiver);  
    },
    
    // 劫持用户赋值操作
    set(target, key, value, receiver) {
        return Reflect.set(target, key, value, receiver);
    }
}