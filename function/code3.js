// 步骤如下：

// 创建一个空的哈希表对象（也可以使用 JavaScript 中的 Map 对象）。

// 遍历第一个数组，将其所有元素添加到哈希表中，以元素的值为键，元素出现的次数为值。

// 遍历第二个数组，对于每个元素，检查哈希表中是否存在该元素，如果存在则将该元素添加到一个新的数组中，同时将哈希表中该元素的值减1，以便处理重复元素。

// 返回新的数组。
/**
 *
 * @param {arr1} arr1
 * @param {arr2} arr2
 * @returns
 */
function findCommonElements(arr1, arr2) {
  // 哈希表的查找时间复杂度为 O(1)
  const hashTable = {};
  const commonElements = [];
  // 遍历第一个数组，将其所有元素添加到哈希表中
  for (let i = 0; i < arr1.length; i++) {
    const element = arr1[i];
    hashTable[element] = (hashTable[element] || 0) + 1;
  }
  // 遍历第二个数组，对于每个元素，检查哈希表中是否存在该元素
  for (let i = 0; i < arr2.length; i++) {
    const element = arr2[i];
    if (hashTable[element] > 0) {
      hashTable[element]--;
    }
  }
  return commonElements;
}
const array1 = [
  { id: 1, name: "a" },
  { id: 2, name: "b" },
  { id: 3, name: "c" },
];
const array2 = [
  { id: 2, name: "b" },
  { id: 3, name: "c" },
  { id: 4, name: "d" },
];
/**
 * 查找对象数据相同的交集 高效算法 o(n)
 * @param {arr1} arr1
 * @param {arr2} arr2
 * @returns
 */
function findArrCommonEle(arr1, arr2) {
  const hash1 = {};
  const intersection = [];
  for (let i = 0; i < arr1.length; i++) {
    hash1[arr1[i]?.id] = arr1[i];
  }
  for (let i = 0; i < arr2.length; i++) {
    //
    if (hash1[arr2[i]?.id]) {
      intersection.push(hash1[arr2[i]?.id]);
    }
  }
  return intersection;
}

console.log("findArrCommonEle", findArrCommonEle(array1, array2));

// 解决Jscript 深拷贝时 存在的循环引用的问题在拷贝过程中维护一个记录已经拷贝过的对象的列表，
// 并检查每个对象是否已经被拷贝过。如果对象已经被拷贝过，则直接返回对应的拷贝对象，避免无限递归。
/**
 * 解决JS 深拷贝的循环引用
 * @param {obj} obj
 * @param {map} map
 * @returns
 */
function deepClone(obj, map = new Map()) {
  if (typeof obj !== "object" || obj === null) {
    return obj;
  }
  if (map.has(obj)) {
    return map.get(obj);
  }
  let newObj;
  if (obj instanceof Array) {
    newObj = [];
    map.set(obj, newObj);
    for (let i = 0; i < obj.length; i++) {
      newObj[i] = deepClone(obj[i], map);
    }
  } else {
    newObj = {};
    map.set(obj, newObj);
    for (const key in obj) {
      newObj[key] = deepClone(obj[key], map);
    }
  }
  return newObj;
}
const obj = { a: 1 };
obj.b = obj;
const newObj = deepClone(obj);
console.log(newObj); // { a: 1, b: [Circular] }
