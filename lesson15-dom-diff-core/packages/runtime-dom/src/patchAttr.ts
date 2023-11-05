export function patchAttr(el, key, value) {
    // 更新属性
    if (value == null) {
      el.removeAttribute(key);
    } else {
      el.setAttribute(key, value);
    }
  }
  