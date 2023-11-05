import { isObject } from "@vue/shared";
import { createVnode, isVNode } from "./vnode";

export function h(type, propsOrChildren, children?) {
  const l = arguments.length;
  // 只有属性或者一个元素儿子
  if (l === 2) {
    // 是对象但是不是数组
    if (isObject(propsOrChildren) && !Array.isArray(propsOrChildren)) {
      // 是个虚拟DOM对象 说明propsOrChildren是虚拟DOM
      if (isVNode(propsOrChildren)) {
        // 创建虚拟DOM 返回
        return createVnode(type, null, [propsOrChildren]); // h('div',h('span'))
      }
      // 走到这里说明propsOrChildren是属性
      return createVnode(type, propsOrChildren); // h('div',{style:{color:'red'}});
    } else {
      // 传递儿子列表的情况
      return createVnode(type, null, propsOrChildren); // h('div',null,[h('span'),h('span')])
    }
  } else {
    // 参数超过3个除了前两个余下的都是儿子
    if (l > 3) {
      // 截取 获取所有的儿子
      children = Array.prototype.slice.call(arguments, 2);
    } else if (l === 3 && isVNode(children)) {
      children = [children]; // 儿子是元素将其包装成 h('div',null,[h('span')])
    }
    return createVnode(type, propsOrChildren, children);
  }
}
