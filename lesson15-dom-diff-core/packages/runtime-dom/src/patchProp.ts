import { patchAttr } from "./patchAttr";
import { patchClass } from "./patchClass";
import { patchEvent } from "./patchEvent";
import { patchStyle } from "./patchStyle";

/**
 * @description 对比修改元素的属性
 * @param el 元素
 * @param key 属性名
 * @param prevValue 老值
 * @param nextValue 新值
 */
export const patchProp = (el, key, prevValue, nextValue) => {
  if (key === "class") {
    // 比对Class
    patchClass(el, nextValue);
  } else if (key === "style") {
    // 对比样式
    patchStyle(el, prevValue, nextValue);
  } else if (/^on[^a-z]/.test(key)) {
    patchEvent(el, key, nextValue);
  } else {
    // attr
    patchAttr(el, key, nextValue);
  }
};
