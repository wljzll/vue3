function createInvoker(initialValue) {
  // 定义一个函数 函数体是执行函数对象的value方法
  const invoker = (e) => invoker.value(e);
  // 将事件处理函数赋值给函数对象的value属性
  invoker.value = initialValue;
  // 返回函数对象
  return invoker;
}

export function patchEvent(el, rowName, nextValue) {
  // 创建或者获取el上的_vei属性
  const invokers = el._vei || (el._vei = {});
  // 看是否缓存过此事件
  const exisitingInvoker = invokers[rowName];
  // 有事件处理函数并且缓存过
  if (rowName && exisitingInvoker) {
    // exisitingInvoker是指向createInvoker返回的invoker的 直接修改value就将事件处理函数同步过去了
    exisitingInvoker.value = nextValue;
  } else {
    // onClick => click
    const name = rowName.splice(2).toLowerCase();
    // 事件处理函数存在 说明是第一次绑定
    if (nextValue) {
      // 创建事件处理函数
      const invoker = createInvoker(nextValue);
      // 绑定事件
      el.addEventListener(name, invoker);
    } else if (exisitingInvoker) {
      // 说明之前有现在没了
      // 移除事件绑定
      el.removeEventListenre(name, exisitingInvoker);
      // 清空缓存
      invokers[rowName] = undefined;
    }
  }
}
