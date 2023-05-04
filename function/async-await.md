<!--
 * @Description: 异步操作 async await generator 
-->
# async await 
## 总结
1. await只能在async函数中使用，不然会报错；
2. async函数返回的是一个Promise对象，有无值看有无return值；
3. await后面最好是接Promise，虽然接其他值也能达到排队效；
4. async/await作用是用同步方式，执行异步操作

## 语法糖
async/await 是一种语法糖 用到的ES6的迭代器函数 ---- generator 函数

# generator 
## 介绍 
generator 函数跟普通函数在写法上的区别就是，多了一个星号*，并且只有在generator函数中才能使用yield，
而yield相当于generator函数执行的中途暂停点，比如下方有3个暂停点。而怎么才能暂停后继续走呢？那就得使用到next方法，
next方法执行后会返回一个对象，对象中有value 和 done两个属性

value : 赞停点后边接的值，yield 后边接的值
done : 是否generator 函数已走完，没走完为false 反之为true

```js
function* gen() {
  yield 1
  yield 2
  yield 3
}
const g = gen()
console.log(g.next()) // { value: 1, done: false }
console.log(g.next()) // { value: 2, done: false }
console.log(g.next()) // { value: 3, done: false }
console.log(g.next()) // { value: undefined, done: true }
```
## yield 后接函数
yield后面接函数的话，到了对应暂停点yield，会马上执行此函数，并且该函数的执行返回值，会被当做此暂停点对象的value

```js
function fn(num) {
  console.log(num)
  return num
}
function* gen() {
  yield fn(1)
  yield fn(2)
  return 3
}
const g = gen()
console.log(g.next()) 
// 1
// { value: 1, done: false }
console.log(g.next())
// 2
//  { value: 2, done: false }
console.log(g.next()) 
// { value: 3, done: true }
```

## yield 后接promise 
```js
function fn(num) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(num)
    }, 1000)
  })
}
function* gen() {
  yield fn(1)
  yield fn(2)
  return 3
}
const g = gen()
console.log(g.next()) // { value: Promise { <pending> }, done: false }
console.log(g.next()) // { value: Promise { <pending> }, done: false }
console.log(g.next()) // { value: 3, done: true }

// 若是想要获取两个promise的结果1和2，可以使用Promise-> then
const g = gen()
const next1 = g.next()
next1.value.then(res1 => {
  console.log(next1) // 1秒后输出 { value: Promise { 1 }, done: false }
  console.log(res1) // 1秒后输出 1

  const next2 = g.next()
  next2.value.then(res2 => {
    console.log(next2) // 2秒后输出 { value: Promise { 2 }, done: false }
    console.log(res2) // 2秒后输出 2
    console.log(g.next()) // 2秒后输出 { value: 3, done: true }
  })
})
```
## next 函数传参数
generator函数可以用next方法来传参，并且可以通过yield来接收这个参数，注意两点
1. 第一次next传参是没用的，只有从第二次开始next传参才有用；
2. next传值时，要记住顺序是，先右边yield，后左边接收参数；
```js
function* gen() {
  const num1 = yield 1
  console.log(num1)
  const num2 = yield 2
  console.log(num2)
  return 3
}
const g = gen()
console.log(g.next()) // { value: 1, done: false }
console.log(g.next(11111))
// 11111
//  { value: 2, done: false }
console.log(g.next(22222)) 
// 22222
// { value: 3, done: true }
```
## promise& next 传参
1. yield 后边接 promise;
2. next 函数传参；

```js
function fn(nums) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(nums * 2)
    }, 1000)
  })
}
function* gen() {
  const num1 = yield fn(1)
  const num2 = yield fn(num1)
  const num3 = yield fn(num2)
  return num3
}
const g = gen()
const next1 = g.next()
next1.value.then(res1 => {
  console.log(next1) // 1秒后同时输出 { value: Promise { 2 }, done: false }
  console.log(res1) // 1秒后同时输出 2

  const next2 = g.next(res1) // 传入上次的res1
  next2.value.then(res2 => {
    console.log(next2) // 2秒后同时输出 { value: Promise { 4 }, done: false }
    console.log(res2) // 2秒后同时输出 4

    const next3 = g.next(res2) // 传入上次的res2
    next3.value.then(res3 => {
      console.log(next3) // 3秒后同时输出 { value: Promise { 8 }, done: false }
      console.log(res3) // 3秒后同时输出 8

       // 传入上次的res3
      console.log(g.next(res3)) // 3秒后同时输出 { value: 8, done: true }
    })
  })
})
```


