import { ShapeFlags } from "packages/shared/src/shapeFlags";
import { isSameVnodeType } from "./vnode";

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
   * @description 比对处理新老属性
   * @param oldProps 老的属性 例如: style class等
   * @param newProps 新的属性
   * @param el 
   */
  const patchProps = (oldProps, newProps, el) => {
    // 新老属性不同
    if (oldProps !== newProps) {
      // 遍历新的属性
      for (let key in newProps) {
        const prev = oldProps[key]; // class: {}, style: {}
        const next = newProps[key]; // class: {}, style: {}
        if (prev !== next) {
          // 更新class style 等
          hostPatchProp(el, key, prev, next);
        }
      }
    }
    for (let key in oldProps) {
      if (!newProps[key]) {
        // 删除属性
        hostPatchProp(el, key, oldProps[key], null);
      }
    }
  };
  
  /**
   * @description 遍历儿子数组 调用unmount方法逐个删除
   * @param children 儿子数组
   */
  const unmountChildren = (children) => {
    for (let i = 0; i < children.length; i++) {
      unmount(children[i]);
    }
  };
  
  /**
   * @description 比对新老儿子
   * @param n1 老的虚拟DOM
   * @param n2 新的虚拟DOM
   * @param el 老的真实DOM
   */
  const patchChildren = (n1, n2, el) => {
    // 老的儿子
    const c1 = n1 && n1.children;
    // 新的儿子
    const c2 = n2.children;
    // 老的父亲的shapeFlag
    const prevShapeFlag = n1.shapeFlag;
    // 新的父亲的shapeFlag
    const shapeFlag = n2.shapeFlag;

    // 新儿子是文本节点
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // 老的是数组
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // 老的是数组 新的是文本就把老的先全部删除
        unmountChildren(c1);
      }
      // 老的如果是数组(已卸载了) 如果不是数组 肯定是文本或者null 不管是文本还是null 如果不相等就换掉
      if (c1 !== c2) {
        hostSetElementText(c2);
      }
    } else {
      /***************** 到这里新的儿子是数组或者null *****************/

      // 老的是数组
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // 新的也是数组 老的也是数组 就是真正的DOM-DIFF
        if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        } else {
          // 新的不是数组 那就是null 由于老的是数组 先卸载掉老的数组
          unmountChildren(c1);
        }
      } else {
        // 老的是文本就把老的删除 如果老的是null 就不需要处理了
        if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
          // 新的肯定不是文本 先把老的删除
          hostSetElementText(el, "");
        }

        // 老的是文本(已清除) 或 null 新的是数组
        if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          // 把新儿子全部添加进去即可
          mountChildren(c2, el);
        }
      }
    }
  };

  /**
   * @description 比对属性和儿子
   * @param n1 老的虚拟DOM
   * @param n2 新的虚拟DOM
   */
  const patchElement = (n1, n2) => {
    // 获取老的DOM 同时赋值到新的虚拟DOM
    let el = (n2.el = n1.el);
    // 老的属性
    let oldProps = n1.props || {};
    // 新的属性
    let newProps = n2.props || {};
    // 对比属性 class style等
    patchProps(oldProps, newProps, el);
    // 对比儿子
    patchChildren(n1, n2, el);
  };
  
  /**
   * @description n1不存在 首次渲染 n1存在更新操作
   * @param n1 老的虚拟DOM
   * @param n2 新的虚拟DOM
   * @param container 容器
   */
  const processElement = (n1, n2, container) => {
    // 初次渲染
    if (n1 === null) {
      mountElement(n2, container);
    } else {
      // 更新
      patchElement(n1, n2);
    }
  };

  /**
   * @description 对比新老虚拟DOM处理老的虚拟DOM 交给processElement处理
   * @param n1 老的虚拟DOM
   * @param n2 新的虚拟DOM
   * @param container 容器
   */
  const patch = (n1, n2, container) => {
    // 老的和新的一样: 1) 老的是null, 新的是null; 2) 老的和新的是同一个虚拟DOM
    if (n1 === n2) {
      return;
    }

    // 有老节点 但是老节点和新节点非同一个节点 则无法比对，直接删除老的
    if (n1 && !isSameVnodeType(n1, n2)) {
      unmount(n1);
      n1 = null;
    }
    
    // 走到这里要么是初次渲染 要么是更新
    processElement(n1, n2, container);
  };
  
  /**
   * @description 卸载虚拟DOM对应的真实DOM
   * @param vnode 有真实DOM的虚拟DOM
   */
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
    // 添加个_vnode 保存上次的虚拟DOM 下次进来能取到这个属性 说明非首次渲染
    container._vnode = vnode;
  };

  return {
    render,
  };
};
