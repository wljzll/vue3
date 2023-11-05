import { isString } from "@vue/shared";
import { ShapeFlags } from "packages/shared/src/shapeFlags";

/**
 * @description 判断当前传入的值是否是虚拟DOM
 * @param value 传入的值
 * @returns 是否是虚拟DOM
 */
export function isVNode(value) {
  return value ? value.__v_isVNode === true : false;
}

/**
 * @description 判断是不是同一个虚拟DOM
 * @param n1 老虚拟DOM
 * @param n2 新虚拟DOM
 * @returns
 */
export const isSameVnodeType = (n1, n2) => {
  return n1.type === n2.type && n1.key === n2.key;
};
/**
 * @description 创建虚拟DOM
 * @param type 组件的类型
 * @param props 组件的属性
 * @param children 组件的儿子
 * @returns
 */
export const createVnode = (type, props, children?) => {
  // 判断虚拟DOM类型
  const shapeFlag = isString(type) ? ShapeFlags.ELEMENT : 0;

  const vnode = {
    __v_isVNode: true, // 标识是不是虚拟DOM
    type, // 虚拟DOM的类型 div p
    props, // 虚拟DOM的属性难
    key: props && props["key"],
    el: null, // 真实DOM节点
    children, // 儿子的虚拟DOM
    shapeFlag, // 标识虚拟DOM的类型
  };

  // 如果儿子存在
  if (children) {
    let type = 0;
    // 儿子是数组
    if (Array.isArray(children)) {
      type = ShapeFlags.ARRAY_CHILDREN;
    } else {
      // 不是数组就只有一个 要么是文本要么是数子
      children = String(children);
      type = ShapeFlags.TEXT_CHILDREN;
    }
    // 最后把儿子的shapeFlag同步到父虚拟DOM上
    vnode.shapeFlag |= type;
  }
  return vnode;
};
