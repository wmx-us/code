/*
 * @Description:
 */
/*
 * @Description:
 */
var isObject = (val) => val && typeof val === "object"; // 判断是否为对象
/**
 *
 * @param {递归深冻结对象} obj
 * @returns
 */
function deepFreeze(obj) {
  if (isObject(obj) && !Object.isFrozen(obj)) {
    // <---遍历所有属性并递归调用Object.freeze()（使用第3章介绍的map）
    // <---跳过已经冻结过的对象，冻结没有被冻结过的对象
    // <---跳过所有的函数，即使从技术上说，函数也可以被修改，但是我们更希望注意在数据的属性上
    Object.keys(obj).forEach((name) => deepFreeze(obj[name]));
    // <---冻结根对象
    Object.freeze(obj);
  }
  return obj;
}

const arr = [
  {
    children: [
      {
        children: null,
        id: 1,
        name: "红外报警",
      },
    ],
    id: 1,
    name: "烟雾报警器",
  },
  {
    children: [
      {
        children: null,
        id: 1,
        name: "红外报警",
      },
    ],
    id: 2,
    name: "红外报警器",
  },
];

const newData = arr.map((item) => ({
  value: item.id,
  label: item.name,
  children: item.children
    ? item.children.map((item) => ({
        value: item.id,
        label: item.name,
        children: item.children,
      }))
    : null,
}));
const modifiedArr = arr.map((item) => ({
  value: item.id,
  label: item.name,
  children: item.children
    ? item.children.map((child) => ({
        value: child.id,
        label: child.name,
        children: child.children,
      }))
    : null,
}));

console.log("modifiedArr", modifiedArr);
