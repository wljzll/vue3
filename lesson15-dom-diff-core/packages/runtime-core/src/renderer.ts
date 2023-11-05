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
  const mountElement = (vnode, container, anchor) => {
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
    hostInsert(el, container, anchor);
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

  const patchKeydChildren = (c1, c2, container) => {
    let i = 0;
    let l2 = c2.length; // 新儿子的长度
    let e1 = c1.length - 1; // 老儿子长度-1
    let e2 = l2 - 1; // 新儿子长度 - 1
    /********* 情况1: sync from start 更新可能相同的节点 ********/
    // 头相同尾不同
    // (a b) c     e1 = 2
    // (a b) c d   e2 = 3
    // i = 3; e1 = 2; e2 = 3;
    while (i <= e1 && i <= e2) {
      const n1 = c1[i];
      const n2 = c2[i];
      // 如果两个节点是同一个节点
      if (isSameVnodeType(n1, n2)) {
        // 更新属性
        patch(n1, n2, container);
      } else {
        break;
      }
      i++;
    }

    /********* 情况2: sync from end 更新可能相同的节点 *********/
    // 头不同尾相同
    // (a b c)       e1 = 2
    // d (a b c)     e2 = 3
    // i = 0; e1 = -1; e2 = 0;
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1];
      const n2 = c2[e2];
      // 如果两个节点是同一个节点
      if (isSameVnodeType(n1, n2)) {
        // 更新属性
        patch(n1, n2, container);
      } else {
        break;
      }
      e1--;
      e2--;
    }

    // 经过1和2的处理
    // (a b)    e1 = 1
    // (a b) c  e2 = 2
    // i = 2, e1 = 1, e2 = 2

    // (a b)    e1 = 1
    // c (a b)  e2 = 2
    // i = 0, e1 = -1, e2 = 0

    // (a b) c     e1 = 2
    // (a b) d e   e2 = 3
    // i = 2; e1 = 2; e2 = 3;
    if (i > e1) {
      // 说明有新增的部分
      if (i <= e2) {
        // 经过上面两步处理过之后 获取新的儿子中新增部分第一个后面是否还有节点
        const nextPos = e2 + 1;
        // 如果还有节点就是插入到这个节点前面
        const anchor = nextPos < c2.length ? c2[nextPos].el : null;
        while (i <= e2) {
          patch(null, c2[i], container, anchor);
          i++;
        }
      }
    } else if (i > e2) {
      // 说明老的有需要删除的部分
      // a b c  e1 = 2
      // a b    e2 = 1
      // i = 2; e1 = 2; e2 = 1;

      // a b c    e1 = 2
      //   b c    e2 = 1
      // i = 1; e1 = 0; e2 = -1;

      while (i <= e1) {
        unmount(c1[i]);
        i++;
      }
    }

    // 5. unknown sequence
    // a b [c d e] f g    e1 = 6
    // a b [e c d h] f g  e2 = 7
    // i = 2, e1 = 4, e2 = 5

    const s1 = i;
    const s2 = i;

    // 用新儿子未更新的元素做成映射表 key是元素 值是元素在新儿子列表里的索引
    const keyToNewIndexMap = new Map();
    for (let i = s2; i <= e2; i++) {
      const nextChild = c2[i];
      keyToNewIndexMap.set(nextChild.key, i); // [e: 2, c: 3, d: 4, h: 5]
    }

    // 新的里没有做处理的元素的个数
    const toBePatched = e2 - s2 + 1; // 4
    // 用剩余新儿子构建数组 标识是新增的儿子还是需要移动的儿子
    const newIndexToOldMapIndex = new Array(toBePatched).fill(0); // [0,0,0,0]

    // 循环老的: 1) 老的有新的有 => 更新; 2) 老的有新的没有 => 删除;
    for (let i = s1; i <= e1; i++) {
      // 取出来老的儿子
      const prevChild = c1[i];
      // 从新儿子构建的映射表中 取老儿子
      let newIndex = keyToNewIndexMap.get(prevChild.key); // 获取新的索引
      // 没取到则删除这个元素
      if (newIndex == undefined) {
        unmount(prevChild); // 老的有 新的没有直接删除
      } else {
        // 有这个元素
        // newIndex - s2 是这个元素在 keyToNewIndexMap里的索引
        // 新的子元素在对应的老的里的索引
        // newIndexToOldMapIndex中为0的项说明是新增的儿子
        // 不为0的说明是可以复用的
        newIndexToOldMapIndex[newIndex - s2] = i + 1;
        // 更新对应的元素
        patch(prevChild, c2[newIndex], container);
      }
    }

    // 5. unknown sequence
    // a b [c d e] f g    e1 = 6
    // a b [e c d h] f g  e2 = 7
    // i = 2, e1 = 4, e2 = 5

    // 求出连续度最长的元素索引
    let increasingNewIndexSequence = getSequence(newIndexToOldMapIndex);
    let j = increasingNewIndexSequence.length - 1; // 取出最后一个人的索引
    // 倒序遍历剩余的新儿子
    for (let i = toBePatched - 1; i >= 0; i--) {
      const nextIndex = s2 + i; // [ecdh]   找到h的索引 找最后一个新儿子的索引
      const nextChild = c2[nextIndex]; // 找到 h 拿到新儿子
      let anchor = nextIndex + 1 < c2.length ? c2[nextIndex + 1].el : null; // 找到当前元素的下一个元素
      if (newIndexToOldMapIndex[i] == 0) {
        // 这是一个新元素 直接创建插入到 当前元素的下一个即可
        patch(null, nextChild, container, anchor);
      } else {
        // 根据参照物 将节点直接移动过去  所有节点都要移动 （但是有些节点可以不动）
        if (i != increasingNewIndexSequence[j]) {
          hostInsert(nextChild.el, container, anchor); // 操作当前的d 以d下一个作为参照物插入
        } else {
          j--; // 跳过不需要移动的元素， 为了减少移动操作 需要这个最长递增子序列算法
        }
      }
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
        hostSetElementText(el, c2);
      }
    } else {
      /***************** 到这里新的儿子是数组或者null *****************/

      // 老的是数组
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // 新的也是数组 老的也是数组 就是真正的DOM-DIFF
        if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          patchKeydChildren(c1, c2, el);
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
  const processElement = (n1, n2, container, anchor) => {
    // 初次渲染
    if (n1 === null) {
      mountElement(n2, container, anchor);
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
  const patch = (n1, n2, container, anchor = null) => {
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
    processElement(n1, n2, container, anchor);
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

function getSequence(arr) {
  let leg = arr.length;
  let result = [0]; // 保存最长递增子序列的 索引
  let resultLastIndex; //  result中的最后一个值 这个值是arr中值的索引
  const p = arr.slice(0); // 里面内容无所谓 和 原本的数组相同 用来存放索引

  let start;
  let end;
  let middle = 0;

  for (let i = 0; i < leg; i++) {
    const arrI = arr[i];
    if (arrI !== 0) {
      // 忽略0
      resultLastIndex = result[result.length - 1];
      // 如果arr对应索引位置的值小于result对应索引位置的值
      if (arr[resultLastIndex] < arrI) {
        p[i] = resultLastIndex; // 标记当前前一个对应的索引
        result.push(i); // 把arr对应的值的索引追加到数组里
        continue;
      }
      // 上面处理完以后 result = [0,1]; 遇到了arr中的3 不满足上面的判断往下走

      // 到这里说明arrI要小于 result里收集的最后一个 那就需要二分查找 result里第一个比他大的那个 然后替换掉
      // 比如 [2,4] 对应的result=[0,1] 新的值是3， 我们要用3的索引替换4对应的索引1

      start = 0;
      end = result.length - 1;
      // 例如: [2,4] => 3
      // start = 0; end = 1; middle = 1; 结果: 4 > 3
      // start = 0; end = 1; middle = 0; 结果: 2 < 3 找到了
      // start = 1; end = 1;             start < end不成立
      while (start < end) {
        middle = ((start + end) / 2) | 0; // 向下取整
        // 中间值小于arrI
        if (arr[result[middle]] < arrI) {
          // 去下半区间找
          start = middle + 1;
        } else {
          // 去上半区间找
          end = middle;
        }
      }
      if (arr[result[start]] > arrI) {
        if (start > 0) {
          p[i] = result[start - 1]; // 要将他替换的前一个记住
        }
        result[start] = i; // 把4的索引替换成3的索引 result = [0, 2]
      }
    }
  }
  let i = result.length; // 总长度
  let last = result[i - 1]; // 找到了最后一项
  while (i-- > 0) {
    // 根据前驱节点一个个向前查找
    result[i] = last; // 最后一项肯定是正确的
    last = p[last];
  }
  return result;
}
