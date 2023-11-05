export function patchStyle(el, prev, next) {
  const style = el.style;
  // 遍历最新的
  for (let key in next) {
    // 不管老的是否有 用最新的覆盖即可
    style[key] = next[key];
  }
  // 老的有
  if (prev) {
    // 遍历老的
    for (let key in prev) {
      // 新的里没有
      if (next[key] === null) {
        // 删除
        style[key] = null;
      }
    }
  }
}
