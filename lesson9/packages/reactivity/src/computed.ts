import { isFunction } from "@vue/shared";
import { ReactiveEffect } from "@vue/reactivity";
import { activeEffect, trackEffect, triggerEffect } from "./effect";

class computedRefImpl {
  public effect;
  public _value;
  public dep;
  public _dirty = true;
  constructor(getter, public setter) {
    // computed底层其实就是一个Effect实例
    this.effect = new ReactiveEffect(getter, () => {
      // 自定义渲染scheduler
      if (!this._dirty) {
        this._dirty = false;
        triggerEffect(this.dep);
      }
    });
  }
  get value() {
    // 取computed时 可能是在渲染Effect中取值 则收集该Effect
    // 当computed依赖的值改变或computed改变 触发该Effect执行
    if (activeEffect) {
      trackEffect(this.dep || (this.dep = new Set()));
    }
    // 如果是脏值, 执行函数
    if (this._dirty) {
      // 先把_dirty置为false
      this._dirty = false;
      // 执行computed对应的Effect实例的run方法 也就是执行computed传入的getter函数或传入对象的get函数
      // 执行getter 触发依赖收集 computed getter函数里依赖值会收集computed对应的effect
      // 当computed依赖的值发生变化 trigger computed的effect 执行computed自定义的渲染器 触发computed收集的Effect执行 重新更新页面
      this._value = this.effect.run();
    }
    // 返回结果
    return this._value;
  }
  set value(newValue) {
    this.setter(newValue);
  }
}

/**
 * 
 * @param getterOrOptions 一个函数或者一个包含get/set的对象
 * @returns 
 */
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

/**
 * 1. computed在Effect中使用, 对computed取值, computed将当前激活的渲染Effect收集到自己的effect实例上
 * 2. 接着执行computed的getter函数, 触发getter函数中依赖数据的取值操作, computed依赖的值收集computed本身这个Effect
 * 3. 当computed依赖的数据发生变化时, 触发computed这个Effect执行自定义的渲染器
 * 4. computed又去执行自己收集的Effect, 触发了渲染Effect执行, 页面更新
 */