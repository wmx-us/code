<!--
 * @Description: 异步操作之 Promise学习
-->
## Promise 学习
### 手写promise 
```ts
/**
 * 创建枚举变量保存状态
 */
enum Status {
  /**
   * pendding 为promise 状态结果未知， 不知是否会被resolve还是rejected
   * 只有当Promise 状态为pending resolve和reject才会被执行
   */
  PENDING = "pending",
  /**
   * fulfilled 状态说明此时promise 已经被resolve了
   * 只有当Promise 的状态为FulFilled的时候，then方法传入的OnFulilled的函数才可以加入微任务队列
   * 如果当前的Promise 状态的为pending ，OnFulilled函数只能加入成功的队列
   */
  FULFILLED = "fulfilled",
  /**
   * 状态为rejected 此时Promise已经被reject
   * 只有当Promise 的状态为reject的时候，then方法传入的OnRejected的函数才可以加入微任务队列
   * 如果当前的Promise 状态的为pending ，OnFulilled函数只能加入失败的队列
   */
  REJECTED = "rejected",
}
/**
 * 定义Reoslve
 */
interface Resolve<T> {
  (value: T | PromiseLike<T>): void;
}
/**
 * 定义rejected 接口
 */
interface Reject {
  (reason?: any): void;
}
/**
 *  定义executer 函数
 */
interface Executer<T> {
  (resolve: Resolve<T>, reject: Reject): void;
  // (
  //   resolve: (value: T | PromiseLike<T>) => void,
  //   reject: (reason?: any) => void
  // ): void;
}

/**
 *  Promise/A+ 仅是规范，通过Promise 实现都会被认可   Promise 是基于 duck typing 检测thenable 都会被检测。
 *
 */
interface PromiseLike<T> {
  then<TResult1 = T, TResult2 = never>(
    onFulillted?:
      | ((value: T | PromiseLike<T>) => TResult1 | PromiseLike<TResult1>)
      | undefined
      | null,
    onRejected?:
      | ((reason: any) => TResult2 | PromiseLike<TResult2>)
      | undefined
      | null
  ): PromiseLike<TResult1 | TResult2>;
}
/**
 * Ts Mypromise
 */
class MyPromise<T> {
  private state: Status = Status.PENDING; // promise 状态
  private onFulfilledCbs = [] as (() => void)[]; // 成功时的回调函数
  private onRejectedCbs = [] as (() => void)[]; // 失败时的回调函数
  private value!: T | PromiseLike<T>; // promise 传递的值 合法的JS 值
  private reason: any; // 显示该promise 失败的原因

  constructor(executer: Executer<T>) {
    try {
      // 作为参数传递给 Promise 的excuter 函数被立即执行
      executer(this.resolve, this.reject);
    } catch (e) {
      // 通过rejected 捕获异常
      this.reject(e);
    }
  }
  /**
   *
   * @param value resove 成功的函数
   */
  resolve: Resolve<T> = (value: T | PromiseLike<T>) => {
    try {
      // 模拟 创建微任务
      setTimeout(() => {
        /**
         * Promise 处于pending 状态时会执行resolve 方法的实际逻辑
         * resolve 方法会做以下几件事：
         * 1. promise 状态更新为fulfilled
         * 2. resolve 接受的value 值赋值给 promise的value
         * 3. 执行onFulfilledCbs 的回调函数 且清空队列
         */
        if (this.state === Status.PENDING) {
          this.state = Status.FULFILLED;
          this.value = value;
          this.onFulfilledCbs.forEach((fn) => fn());
          this.onFulfilledCbs = [];
        }
      });
    } catch (e) {
      this.reject(e);
    }
  };
  /**
   *
   * @param reason reject 失败的函数
   */
  reject: Reject = (reason: any) => {
    try {
      // 模拟创建微任务
      setTimeout(() => {
        /**
         * Promise 处于pending 状态时会执行resolve 方法的实际逻辑
         * resolve 方法会做以下几件事：
         * 1. promise 状态更新为fulfilled
         * 2. reject 接受的reason 值赋值给 promise的reason
         * 3. 执行onRejectedCbs 的回调函数 且清空队列
         */
        if (this.state === Status.PENDING) {
          this.state = Status.REJECTED;
          this.reason = reason;
          this.onRejectedCbs.forEach((fn) => fn());
          this.onRejectedCbs = [];
        }
      });
    } catch (error) {
      this.reject(error);
    }
  };
  /**
   *
   * @param onFulfilled then 成功的回调
   * @param onRejected then 失败的回调
   * @returns
   */
  then<TResult1 = T, TResult2 = never>(
    onFulfilled?:
      | ((value: T | PromiseLike<T>) => TResult1 | PromiseLike<TResult1>)
      | undefined
      | null,
    onRejected?:
      | ((reason: any) => TResult2 | PromiseLike<TResult2>)
      | undefined
      | null
  ): MyPromise<TResult1 | TResult2> {
    // 确保onfulfilled 和onRejected 是函数类型 且需要做一个类型转换
    onFulfilled =
      typeof onFulfilled === "function"
        ? onFulfilled
        : (val: T | PromiseLike<T>) => val as any;
    onRejected =
      typeof onRejected === "function"
        ? onRejected
        : (r: any) => {
            throw r;
          };
    // 实现promise 链式调用的核心 且需返回一个新的promise
    const promise2 = new MyPromise<TResult1 | TResult2>(
      (resolve: Resolve<TResult1 | TResult2>, reject: Reject) => {
        // 若promise 已经处于Fulfilled 的状态 将onFulfilled 放入微任务队列中执行
        if (this.state === Status.FULFILLED) {
          setTimeout(() => {
            try {
              let x = onFulfilled!(this.value);
              this.resolvePromise(promise2, x, resolve, reject);
            } catch (error) {
              reject(error);
            }
          });
          // 若promise 已经处于Reject 的状态 将onRejected 放入微任务队列中执行
        } else if (this.state === Status.REJECTED) {
          setTimeout(() => {
            try {
              let x = onRejected!(this.reason);
              this.resolvePromise(promise2, x, resolve, reject);
            } catch (error) {
              reject(error);
            }
          });
        } else if (this.state === Status.PENDING) {
          /**
           * Promise 仍处于 PENDING 状态，尚不能处理回调函数，直接将回调函数加入相应的回调队列。
           * 注意，resolve 中调用回调函数是在微任务中进行的，因此这里不再需要创建微任务。
           **/
          this.onFulfilledCbs.push(() => {
            try {
              let x = onFulfilled!(this.value);
              this.resolvePromise(promise2, x, resolve, reject);
            } catch (e) {
              reject(e);
            }
          });
          this.onRejectedCbs.push(() => {
            try {
              let x = onRejected!(this.reason);
              this.resolvePromise(promise2, x, resolve, reject);
            } catch (e) {
              reject(e);
            }
          });
        }
      }
    );
    return promise2;
  }
  /**
   * 由于then 方法返回值是一个Promise，如then 方法的回调函数返回也是Promise
   * 那么就会造成promise 嵌套，则需要一个函数对then方法的回调函数进行处理 resolvePromise
   * 则处理
   * @param promise then 方法的返回值
   * @param x then 回调函数的返回值
   * @param resolve
   * @param reject
   */
  resolvePromise<T>(
    promise: MyPromise<T>,
    x: T | PromiseLike<T>,
    resolve: Resolve<T>,
    reject: Reject
  ) {
    // 防止循环引用
    if (promise === x) {
      const error = new TypeError(
        "TypeError: Circular reference--不能返回自身的promise"
      );
      reject(error);
    }

    let called = false; // 防止reslove 和reject 多次调用

    if (x && (typeof x === "object" || typeof x === "function")) {
      try {
        const then = (x as PromiseLike<T>).then;
        // 如果 x 是一个thenable
        if (typeof then === "function") {
          then.call(
            x,
            (y: T | PromiseLike<T>) => {
              if (called) return;
              called = true;
              // 递归执行 解析 直到thenable 不再是thenable ,取出其值，
              this.resolvePromise(promise, y, resolve, reject);
            },
            (r: any) => {
              if (called) return;
              called = true;
              reject(r);
            }
          );
        } else {
          // 非promise 直接成功
          resolve(x);
        }
      } catch (error) {
        if (called) return;
        called = true;
        reject(error);
      }
    } else {
      resolve(x);
    }
  }
  /**
   *
   * @param promises 实现 Promise的all 方法
   * @returns
   */
  static all<T>(promises: Array<MyPromise<T> | T>): MyPromise<Array<T>> {
    // return new Promise((resolve, reject) => {
    //   Promise.all(promises)
    //     .then((results) => {
    //       resolve(results);
    //     })
    //     .catch((err) => {
    //       reject(err);
    //     });
    // });

    // 1. 接收一个Promise数组，数组中如有非Promise项，则此项当做成功；
    // 2. 如果所有Promise都成功，则返回成功结果数组；
    // 3. 如果有一个Promise失败，则返回这个失败结果；
    const result: T[] = [];
    let count = 0;
    return new MyPromise((resolve, reject) => {
      const addData = (index: number, value: T) => {
        result[index] = value;
        count++;
        if (count === promises.length) resolve(result);
      };
      promises.forEach((promise, index) => {
        if (promise instanceof MyPromise) {
          promise.then(
            (res: any) => {
              addData(index, res);
            },
            (err) => reject(err)
          );
        } else {
          addData(index, promise);
        }
      });
    });
  }

  /**
   *
   * @param promises 实现race 的方法
   * @returns
   */
  static race<T>(promises: Array<MyPromise<T>>): Promise<T> {
    // return new Promise((resolve, reject) => {
    //   Promise.race(promises)
    //     .then((result) => {
    //       resolve(result);
    //     })
    //     .catch((err) => {
    //       reject(err);
    //     });
    // });

    // 接收一个Promise数组，数组中如有非Promise项，则此项当做成功；
    // 哪个Promise最快得到结果，就返回那个结果，无论成功失败；

    return new Promise((resolve, reject) => {
      promises.forEach((promise) => {
        if (promise instanceof MyPromise) {
          promise.then(
            (res) => {
              resolve(res);
            },
            (err) => {
              reject(err);
            }
          );
        } else {
          resolve(promise);
        }
      });
    });
  }
  /**
   *
   * @param promises 实现AllSettled方法
   * @returns
   */
  static allSettled<T>(
    promises: Array<Promise<T>>
  ): MyPromise<Array<PromiseSettledResult<T>>> {
    // 1. 接收一个Promise数组，数组中如有非Promise项，则此项当做成功；
    // 2. 把每一个Promise的结果，集合成数组后返回；
    return new MyPromise((resolve) => {
      const results: Array<PromiseSettledResult<T>> = [];
      let count = 0;

      promises.forEach((promise, index) => {
        Promise.resolve(promise)
          .then((value) => {
            results[index] = { status: "fulfilled", value };
          })
          .catch((reason) => {
            results[index] = { status: "rejected", reason };
          })
          .finally(() => {
            count++;
            if (count === promises.length) resolve(results);
          });
      });
    });
  }
  /**
   *
   * @param promises 实现 any 方法
   * @returns
   */
  static any<T>(promises: Array<Promise<T>>): Promise<T> {
    let errors: Array<any> = [];
    // 1. 接收一个Promise数组，数组中如有非Promise项，则此项当做成功；
    // 2. 如果有一个Promise成功，则返回这个成功结果；
    // 3. 如果所有Promise都失败，则报错；
    return new Promise((resolve, reject) => {
      promises.forEach((promise) => {
        Promise.resolve(promise)
          .then((value) => {
            resolve(value);
          })
          .catch((reason) => {
            errors.push(reason);
            if (errors.length === promises.length) reject(errors);
          });
      });
    });
  }
}

// 测试下
const test3 = new MyPromise((res, rej) => {
  res(100); //
}).then(
  (res) => console.log("success", res),
  (err) => console.log("fail", err)
);

const test4 = new MyPromise((resolve, reject) => {
  resolve(100);
})
  .then(
    (res: any) => new MyPromise((resolve, reject) => reject(2 * res)),
    (err) => new MyPromise((reslove, reject) => reslove(3 * err))
  )
  .then(
    (res) => console.log("success", res),
    (err) => console.log("fail", err)
  );
```

### Promise/A + 规范解读
#### 术语
1. "prmoise" 是一个拥有符合本规范的 then 方法的对象或者函数；
2. "thenable" 是一个定义了 then 方法的对象或者函数；
3. "value" 是 JavaScript 的任意合法值(包括 undefined, thenable, promise)；
4. "exception" 是一个用 throw 语句抛出的 value ；
5. "reason" 是一个表示 promise 被 rejected 的 value ；

#### 要求
##### promise 的状态 
promise 必须是以下三种状态 ：pendding, fulfilled, rejected .

● 当 promise 处于 pending 状态时：
  ○ 可以转换到 fulfilled 或 rejected 状态；
● 当 promise 处于 fulfilled 状态时：
  ○ 不能转换到其他状态；
  ○ 必须有一个 value ，并且不能改变；
● 当 promise 处于 rejected 状态时：
  ○ 不能转换到其他状态；
  ○ 必须有 reason ，并且不能改变；

##### then 方法
promise 必须提供then 方法 ，由此访问 当前或最终的value和reason ，promise 的then方法 接收 两个参数。

```js
       promise.then(onFulfilled, onRejected)
```

● onFulfilled 和 onRejected 都是可选参数：
  ○ 如果 onFulfilled 不是函数，则忽略；
  ○ 如果 onRejected 不是函数，则忽略；
● 如果 onFulfilled 是一个函数:
  ○ 它必须在 promise 被 fulfilled 后，以 promise 的 value 作为第一个参数调用；
  ○ 它不能在 promise 被 fulfilled 之前调用；
  ○ 它不能被调用多次；
● 如果 onRejected 是一个函数：
  ○ 它必须在 promise 被 rejected 后，以 promise 的 reason 作为第一个参数调用；
  ○ 它不能能在 promise 被 rejected 之前调用；
  ○ 它不能被调用多次；
  ○ 在 execution context 栈（执行上下文栈）只包含平台代码之前， onFulfilled 或者 onRejected 不能被调用 
    (译者注: 异步执行回调)；
● onFulfilled 或者 onRejected 必须以函数形式调用（即不能有this值）
● then 方法可以被同一个 promise 调用多次
  ○ 如果或者当 promise 处于 fulfilled 状态， 所有自己的 onFulfilled 回调函数，必须要按照 then 注册的顺序被调用；
  ○ 如果或者当 promise 处于 rejected 状态， 所有自己的 onRejected 回调函数，必须要按照 then 注册的顺序被调用；
● then 方法必须要返回 promise

```js
        promise2 = promise1.then(onFulfilled, onRejected);
```

  ○ 如果 onFulfilled 或者 onRejected 返回一个值 x ，则执行 Promise Resolution Procedure：[[Resolve]](promise2, x)；
  ○ 如果 onFulfilled 或者 onRejected 抛出异常 e ， promise2 必须以 e 作为 reason ，转到 rejected 状态；
  ○ 如果 onFulfilled 不是函数，并且 promise1 处于 fulfilled 状态 ，则 promise2 必须以与 promise1 同样的 value 被 fulfilled；
  ○ 如果 onRejected 不是函数，并且 promise1 处于 rejected 状态 ，则 promise2 必须以与 promise1 同样的 reason 被 rejected；

##### Promise Resolution Procedure 

Promise Resolution Procedure 是一个抽象操作。它以一个 promise 和一个 value 作为输入，记作：[[Resolve]](promise, x) 。 如果 x 是一个 thenable , 它会尝试让 promise 变成与 x 的一样状态 ，前提 x 是一个类似的 promise 对象。否则，它会让 promise 以 x 作为 value 转为 fulfilled 状态。
这种对 thenables 的处理允许不同的 promise 进行互操作，只要它们暴露一个符合 Promises/A+ 的 then 方法。它还允许 Promises/A+ 实现使用合理的 then 方法“同化”不一致的实现。
[[Resolve]](promise, x) 执行以下步骤：
● 如果 promise 和 x 引用的是同一个对象，则以一个 TypeError 作为 reason 让 promise 转为 rejeted 状态；
● 如果 x 也是一个 promise ，则让 promise 接受它的状态：
  ○ 如果 x 处于 pending 状态，promise 必须保持 pending 状态，直到 x 变成 fulfilled 或者 rejected 状态，promise 才同步改变；
  ○ 如果或者当 x 处于 fulfilled 状态， 以同样的 value 让 promise 也变成 fulfilled 状态；
  ○ 如果或者当 x 处于 rejected 状态， 以同样的 reason 让 promise 也变成 rejected 状态；
● 如果 x 是一个对象或者函数：
  ○ 令 then 等于 x.then；
  ○ 如果读取 x.then 抛出异常 e ， 以 e 作为 reason 让 promise 变成 rejected 状态；
  ○ 如果 then 是一个函数，以 x 作为 this 调用它，传入第一个参数 resolvePromise ， 第二个参数 rejectPromise ：
    ■ 如果 resolvePromise 被传入 y 调用， 则执行 [[Resolve]](promise, y)；
    ■ 如果 rejectedPromise 被传入 r 调用，则用，r 作为 reason 让 promise 变成 rejected 状态；
    ■ 如果 resolvePromise 和 rejectPromise 都被调用了，或者被调用多次了。只有第一次调用生效，其余会被忽略；
    ■ 如果调用 then 抛出异常 e：
      ● 如果 resolvepromise 或 rejectPromise 已经被调用过了，则忽略它；
      ● 否则, 以 e 作为 reason 让 promise 变成 rejected 状态；
    ■ 如果 then 不是一个函数，以 x 作为 value 让 promise 变成 fulfilled 状态；
● 如果 x 不是对象或函数， 以 x 作为 value 让 promise 变成 fulfilled 状态；
如果一个 promise 被一个循环的 thenable 链中的对象 resolved，而 [[Resolve]](promise, thenable)
的递归性质又使得其被再次调用，根据上述的算法将会陷入无限递归之中。
算法虽不强制要求，但也鼓励实现者检测这样的递归是否存在，并且以 TypeError 作为 reason 拒绝 promise；