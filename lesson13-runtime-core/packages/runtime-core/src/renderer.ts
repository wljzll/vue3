import { ShapeFlags } from "packages/shared/src/shapeFlags";

export const createRenderer = (options) => {
  const {
    insert: hostInsert,
    remove: hostRemove,
    patchProp: hostPatchProp,
    createElement: hostCreateElement,
    createText: hostCreateText,
    setText: hostSetText,
    setElementText: hostSetElementText,
    parentNode: hostParentNode,
    nextSibling: hostNextSibling,
  } = options;

  /**
   * @description 遍历儿子 交给patch处理 挂载儿子们
   * @param children 儿子们
   * @param container 爸爸真实DOM节点
   */
  const mountChildren = (children, container) => {
    for (let i = 0; i < children.length; i++) {
      patch(null, children[i], container);
    }
  };

  /**
   * @description 将虚拟DOM创建成真实DOM 挂载到容器中
   * @param vnode 虚拟DOM
   * @param container 容器
   */
  const mountElement = (vnode, container) => {
    // 解构属性
    const { type, props, shapeFlag } = vnode;
    // 根据type创建真实DOM
    let el = (vnode.el = hostCreateElement(type));
    // 有属性 挂载属性
    if (props) {
      for (let key in props) {
        hostPatchProp(el, key, null, props[key]);
      }
    }
    // 儿子是文本
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      hostSetElementText(el, vnode.children);
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      // 儿子是数组 递归处理
      mountChildren(vnode.children, el);
    }
    // 递归完成后 将el插入到容器
    hostInsert(el, container);
  };

  /**
   *
   * @param n1 老的虚拟DOM
   * @param n2 新的虚拟DOM
   * @param container 容器
   */
  const patch = (n1, n2, container) => {
    // 老的和新的一样: 老的是null, 新的是null; 老的和新的是同一个虚拟DOM
    if (n1 === n2) {
      return;
    }
    // 初次渲染
    if (n1 === null) {
      mountElement(n2, container);
    }
  };

  const unmount = (vnode) => {
    hostRemove(vnode.el);
  };

  /**
   *
   * @param vnode 虚拟DOM
   * @param container 容器
   */
  const render = (vnode, container) => {
    if (vnode === null) {
      // 存在_vnode且新的vnode为null说明是卸载操作
      if (container._vnode) {
        unmount(container._vnode);
      }
    } else {
      patch(container._vnode || null, vnode, container); // 初始化和更新
    }
    // 添加个_vnode 下次进来能取到这个属性 说明非首次渲染
    container._vnode = vnode;
  };

  return {
    render,
  };
};
