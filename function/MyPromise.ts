/*
 * @Description:MyPromise
 */
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
