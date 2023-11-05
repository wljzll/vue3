export function patchClass(el, value) {
  if (!value) {
    // 值为空说明没有class了 全部移除
    el.removeAttributes("class");
  } else {
    // 有则赋值
    el.className = value;
  }
}
