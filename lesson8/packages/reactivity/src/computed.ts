import { isFunction } from "@vue/shared";
import { ReactiveEffect } from "vue";
import { activeEffect, trackEffect, triggerEffect } from "./effect";

class computedRefImpl {
  public effect;
  public _value;
  public dep;
  public _dirty = true;
  constructor(getter, public setter) {
    this.effect = new ReactiveEffect(getter, () => {
      if (!this._dirty) {
        this._dirty = false;
        triggerEffect(this.dep);
      }
    });
  }
  get value() {
    if (activeEffect) {
      trackEffect(this.dep || (this.dep = new Set()));
      if (this._dirty) {
        // 如果是脏值, 执行函数
        this._dirty = false;
        this._value = this.effect.run();
      }
      return this._value;
    }
  }
}

export function computed(getterOrOptions) {
  // 判断传入的是一个函数还是一个{getter, setter}
  const onlyGetter = isFunction(getterOrOptions);
  let getter;
  let setter;

  // 如果是一个getter函数
  if (onlyGetter) {
    getter = getterOrOptions;
    setter = () => {}; // setter设置为空函数
  } else {
    // 如果是个对象
    getter = getterOrOptions.get;
    setter = getterOrOptions.set || (() => {});
  }

  return new computedRefImpl(getter, setter);
}
