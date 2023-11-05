/**
 *
 * @param {*} arr 传入的数组
 * @returns 最长递增子序列的索引数组
 */
function getSequence(arr) {
  let leg = arr.length;
  let result = [0]; // 保存最长递增子序列的 索引
  let resultLastIndex; //  result中的最后一个值 这个值是arr中值的索引

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
      if(arr[result[start]] > arrI) {
        result[start] = i; // 把4的索引替换成3的索引 result = [0, 2]
      }
    }
  }

  return result;
}

console.log(getSequence([2,4,3,5,8,6,7])); // [0,1,2,3,4,5,6]

/**
 * 默认放arr的第一项result = [0]   对应的是[2]
 * 第一次遍历: result = [0] 取的是arr的第一项 没变化 对应的还是 [2]
 * 第二次遍历: result = [0] 取arr的第二项4, 将4对应的索引追加到result中              result = [0,1] => [2,4]
 * 第三次遍历: result = [0,1] 取arr的第三项3, 结果3比4小, 通过二分查找将4替换掉       result = [0,2] => [2,3]
 * 第四次遍历: result = [0,2] 取arr的第四项5, 结果比3大，将5对应的索引追加到result中  result = [0,2,3] => [2,3,5]
 * 第五次遍历: result = [0,2,3] 取arr的第五项8,结果比5大,将8对应的索引追加到result中  result = [0,2,3,4] => [2,3,5,8]
 * 第六次遍历: result = [0,2,3,4] 取arr的第六项6,结果比8小，通过二分查找将8替换掉      result = [0,2,3,5] => [2,3,5,6]
 * 第七次遍历: result = [0,2,3,5] 取arr的第七项7,结果比6大，将7对应的索引追加到result中 result = [0,2,3,5,6] => [2,3,5,6,7]
 */
