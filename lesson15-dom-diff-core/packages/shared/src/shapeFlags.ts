export const enum ShapeFlags { // vue3提供的形状标识
  ELEMENT = 1, // 元素类型
  FUNCTIONAL_COMPONENT = 1 << 1, // 函数式组件
  STATEFUL_COMPONENT = 1 << 2, // ？？？
  TEXT_CHILDREN = 1 << 3, // 文本儿子
  ARRAY_CHILDREN = 1 << 4, // 数组儿子
  SLOTS_CHILDREN = 1 << 5, // 插槽儿子
  TELEPORT = 1 << 6,
  SUSPENSE = 1 << 7,
  COMPONENT_SHOULD_KEEP_ALIVE = 1 << 8,
  COMPONENT_KEPT_ALIVE = 1 << 9,
  COMPONENT = ShapeFlags.STATEFUL_COMPONENT | ShapeFlags.FUNCTIONAL_COMPONENT,
}
