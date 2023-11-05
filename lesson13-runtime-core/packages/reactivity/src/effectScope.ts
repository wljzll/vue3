export let activeEffectScope;
class EffectScope {
  scopes = null; // 收集子EffectScope
  active = true; // 当前的EffectScope是否是激活状态
  public effects = []; // 管理的Effect
  parent; // 当前EffectScope的父级EffectScope
  constructor(detached = false) {
    if (!detached && activeEffectScope) {
        this.parent = activeEffectScope; // 当前激活的EffectScope赋值给当前刚new出来的EffectScope
        (activeEffectScope.scope || (activeEffectScope.scope = [])).push(this);
    }
  }
  run(fn) { // 调用run方法传入回调函数 fn中有effect
    if (this.active) { // 只有激活的时候才会执行
      try {
        activeEffectScope = this;
        return fn();
      } finally {
        activeEffectScope = this.parent;
      }
    }
  }
  // 停止所有的Effect
  stop() {
    if (this.active) {
      for (let i = 0; i < this.effects.length; i++) {
        this.effects[i].stop();
      }
      // 停止EffectScope时 如果有儿子EffectScope也要调用儿子的Stop方法 停止儿子的effect
      if (this.scopes) {
        for (let i = 0; i < this.scopes.length; i++) {
            this.scopes[i].stop();
          }
      }
      this.active = false;
    }
  }
}
/**
 * 调用effectScope的run方法传入effect
 *
 */
export function effectScope(fn) {
  return new EffectScope();
}

export function recordEffectScope(effect) {
  if (activeEffectScope && activeEffectScope.active) {
    activeEffectScope.effects.push(effect);
  }
}
