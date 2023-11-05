// 元素的增删改查/查找关系/文本的增删改查

export const nodeOps = {
  // 向父元素尾部或中间添加子元素
  // insertBefore是移动性的操作元素
  insert(child, parent, anchor) {
    parent.insertBefore(child, anchor || null);
  },
  // 移除元素
  remove(child) {
    const parent = child.parentNode;
    if (parent) {
      parent.removeChild(child);
    }
  },
  // 根据选择器查找元素
  querySelector(selector) {
    return document.querySelector(selector);
  },
  // 查找元素的父节点
  parentNode(node) {
    return node.parent;
  },
  // 查找相邻节点
  nextSibling(node) {
    return node.nextSibling;
  },
  // 设置文本元素中内容
  setElementText(el, text) {
    el.textContent = text;
  },
  // 创建文本节点
  createText(text) {
    return document.createTextNode(text);
  },
  setText: (node, text) => (node.nodeValue = text), //  设置文本节点内容
};
