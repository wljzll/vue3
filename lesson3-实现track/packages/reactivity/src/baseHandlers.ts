import { ReactiveFlags } from "@vue/reactivity";
import {track} from './effect'


export const mutableHandlers = {
    // 劫持用户取值操作
    get(target, key, receiver) {
        if (key == ReactiveFlags.IS_REACTIVE) {
            return true;
        }
        track(target, key);
        return Reflect.get(target, key, receiver);
    },
    
    // 劫持用户赋值操作
    set(target, key, value, receiver) {
        return Reflect.set(target, key, value, receiver);
    }
}