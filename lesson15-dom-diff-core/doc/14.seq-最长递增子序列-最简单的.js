



/**
 * 
 * @param {*} arr 传入的数组
 * @returns 最长递增子序列的索引数组
 */
function getSequence(arr) {
  let leg = arr.length;
  let result = [0]; // 保存最长递增子序列的 索引
  let resultLastIndex; //  result中的最后一个值 这个值是arr中值的索引

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
    }
  }

  return result;
}

console.log(getSequence([2, 6, 7, 8, 9, 11])); // [0,1,2,3,4,5]
