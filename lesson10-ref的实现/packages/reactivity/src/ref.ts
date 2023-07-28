import {
  activeEffect,
  reactive,
  trackEffect,
  triggerEffect,
} from "@vue/reactivity";
import { isObject } from "@vue/shared";

/**
 *
 * @param rawValue ref传进来的原始值
 * @param shallow 深浅ref
 * @returns ref实例
 */
function createRef(rawValue, shallow) {
  return new RefImpl(rawValue, shallow);
}

export function ref(value) {
  // 深度代理
  return createRef(value, false);
}

function toReactive(value) {
  // 将对象转化为响应式的
  return isObject(value) ? reactive(value) : value;
}

class RefImpl {
  public _value;
  public dep;
  public _v_isRef = true;
  constructor(public rawValue, public _shallow) {
    // 如果是浅代理 不做处理
    // 如果是ref深度代理 将对象用reactive处理下
    this._value = _shallow ? rawValue : toReactive(rawValue);
  }
  get value() {
    // 获取值的时候如果有activeEffect 则将effect收集到当前Ref的dep中
    if (activeEffect) {
      trackEffect(this.dep || (this.dep = new Set()));
    }
    return this._value;
  }
  set(newValue) {
    // 设置的非老值时再去改变
    if (newValue !== this._value) {
      // 原始值
      this.rawValue = newValue;
      // 深浅ref做不同处理
      this._value = this._shallow ? newValue : toReactive(newValue);
      // 触发更新
      triggerEffect(this.dep);
    }
  }
}

class ObjectRefImpl {
  public _v_isRef = true;
  constructor(public _object, public _key) {}
  get value() {
    return this._object[this._key];
  }
  set value(newVal) {
    this._object[this._key] = newVal;
  }
}

/**
 * 
 * @param object 响应式对象
 * @param key 
 * @returns 
 */
export function toRef(object, key) {
  return new ObjectRefImpl(object, key);
}

export function toRefs(object) {
  const ret = Array.isArray(object) ? new Array(object.length) : {};
  for (const key in object) {
    ret[key] = toRef(object, key);
  }
  return ret;
}
