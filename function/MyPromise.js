/*
 * @Description:MyPromise
 */
/**
 * 创建枚举变量保存状态
 */
var Status;
(function (Status) {
    /**
     * pendding 为promise 状态结果未知， 不知是否会被resolve还是rejected
     * 只有当Promise 状态为pending resolve和reject才会被执行
     */
    Status["PENDING"] = "pending";
    /**
     * fulfilled 状态说明此时promise 已经被resolve了
     * 只有当Promise 的状态为FulFilled的时候，then方法传入的OnFulilled的函数才可以加入微任务队列
     * 如果当前的Promise 状态的为pending ，OnFulilled函数只能加入成功的队列
     */
    Status["FULFILLED"] = "fulfilled";
    /**
     * 状态为rejected 此时Promise已经被reject
     * 只有当Promise 的状态为reject的时候，then方法传入的OnRejected的函数才可以加入微任务队列
     * 如果当前的Promise 状态的为pending ，OnFulilled函数只能加入失败的队列
     */
    Status["REJECTED"] = "rejected";
})(Status || (Status = {}));
/**
 * Ts Mypromise
 */
var MyPromise = /** @class */ (function () {
    function MyPromise(executer) {
        var _this = this;
        this.state = Status.PENDING; // promise 状态
        this.onFulfilledCbs = []; // 成功时的回调函数
        this.onRejectedCbs = []; // 失败时的回调函数
        /**
         *
         * @param value resove 成功的函数
         */
        this.resolve = function (value) {
            try {
                // 模拟 创建微任务
                setTimeout(function () {
                    /**
                     * Promise 处于pending 状态时会执行resolve 方法的实际逻辑
                     * resolve 方法会做以下几件事：
                     * 1. promise 状态更新为fulfilled
                     * 2. resolve 接受的value 值赋值给 promise的value
                     * 3. 执行onFulfilledCbs 的回调函数 且清空队列
                     */
                    if (_this.state === Status.PENDING) {
                        _this.state = Status.FULFILLED;
                        _this.value = value;
                        _this.onFulfilledCbs.forEach(function (fn) { return fn(); });
                        _this.onFulfilledCbs = [];
                    }
                });
            }
            catch (e) {
                _this.reject(e);
            }
        };
        /**
         *
         * @param reason reject 失败的函数
         */
        this.reject = function (reason) {
            try {
                // 模拟创建微任务
                setTimeout(function () {
                    /**
                     * Promise 处于pending 状态时会执行resolve 方法的实际逻辑
                     * resolve 方法会做以下几件事：
                     * 1. promise 状态更新为fulfilled
                     * 2. reject 接受的reason 值赋值给 promise的reason
                     * 3. 执行onRejectedCbs 的回调函数 且清空队列
                     */
                    if (_this.state === Status.PENDING) {
                        _this.state = Status.REJECTED;
                        _this.reason = reason;
                        _this.onRejectedCbs.forEach(function (fn) { return fn(); });
                        _this.onRejectedCbs = [];
                    }
                });
            }
            catch (error) {
                _this.reject(error);
            }
        };
        try {
            // 作为参数传递给 Promise 的excuter 函数被立即执行
            executer(this.resolve, this.reject);
        }
        catch (e) {
            // 通过rejected 捕获异常
            this.reject(e);
        }
    }
    /**
     *
     * @param onFulfilled then 成功的回调
     * @param onRejected then 失败的回调
     * @returns
     */
    MyPromise.prototype.then = function (onFulfilled, onRejected) {
        var _this = this;
        // 确保onfulfilled 和onRejected 是函数类型 且需要做一个类型转换
        onFulfilled =
            typeof onFulfilled === "function"
                ? onFulfilled
                : function (val) { return val; };
        onRejected =
            typeof onRejected === "function"
                ? onRejected
                : function (r) {
                    throw r;
                };
        // 实现promise 链式调用的核心 且需返回一个新的promise
        var promise2 = new MyPromise(function (resolve, reject) {
            // 若promise 已经处于Fulfilled 的状态 将onFulfilled 放入微任务队列中执行
            if (_this.state === Status.FULFILLED) {
                setTimeout(function () {
                    try {
                        var x = onFulfilled(_this.value);
                        _this.resolvePromise(promise2, x, resolve, reject);
                    }
                    catch (error) {
                        reject(error);
                    }
                });
                // 若promise 已经处于Reject 的状态 将onRejected 放入微任务队列中执行
            }
            else if (_this.state === Status.REJECTED) {
                setTimeout(function () {
                    try {
                        var x = onRejected(_this.reason);
                        _this.resolvePromise(promise2, x, resolve, reject);
                    }
                    catch (error) {
                        reject(error);
                    }
                });
            }
            else if (_this.state === Status.PENDING) {
                /**
                 * Promise 仍处于 PENDING 状态，尚不能处理回调函数，直接将回调函数加入相应的回调队列。
                 * 注意，resolve 中调用回调函数是在微任务中进行的，因此这里不再需要创建微任务。
                 **/
                _this.onFulfilledCbs.push(function () {
                    try {
                        var x = onFulfilled(_this.value);
                        _this.resolvePromise(promise2, x, resolve, reject);
                    }
                    catch (e) {
                        reject(e);
                    }
                });
                _this.onRejectedCbs.push(function () {
                    try {
                        var x = onRejected(_this.reason);
                        _this.resolvePromise(promise2, x, resolve, reject);
                    }
                    catch (e) {
                        reject(e);
                    }
                });
            }
        });
        return promise2;
    };
    /**
     * 由于then 方法返回值是一个Promise，如then 方法的回调函数返回也是Promise
     * 那么就会造成promise 嵌套，则需要一个函数对then方法的回调函数进行处理 resolvePromise
     * 则处理
     * @param promise then 方法的返回值
     * @param x then 回调函数的返回值
     * @param resolve
     * @param reject
     */
    MyPromise.prototype.resolvePromise = function (promise, x, resolve, reject) {
        var _this = this;
        // 防止循环引用
        if (promise === x) {
            var error = new TypeError("TypeError: Circular reference--不能返回自身的promise");
            reject(error);
        }
        var called = false; // 防止reslove 和reject 多次调用
        if (x && (typeof x === "object" || typeof x === "function")) {
            try {
                var then = x.then;
                // 如果 x 是一个thenable
                if (typeof then === "function") {
                    then.call(x, function (y) {
                        if (called)
                            return;
                        called = true;
                        // 递归执行 解析 直到thenable 不再是thenable ,取出其值，
                        _this.resolvePromise(promise, y, resolve, reject);
                    }, function (r) {
                        if (called)
                            return;
                        called = true;
                        reject(r);
                    });
                }
                else {
                    // 非promise 直接成功
                    resolve(x);
                }
            }
            catch (error) {
                if (called)
                    return;
                called = true;
                reject(error);
            }
        }
        else {
            resolve(x);
        }
    };
    /**
     *
     * @param promises 实现 Promise的all 方法
     * @returns
     */
    MyPromise.all = function (promises) {
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
        var result = [];
        var count = 0;
        return new MyPromise(function (resolve, reject) {
            var addData = function (index, value) {
                result[index] = value;
                count++;
                if (count === promises.length)
                    resolve(result);
            };
            promises.forEach(function (promise, index) {
                if (promise instanceof MyPromise) {
                    promise.then(function (res) {
                        addData(index, res);
                    }, function (err) { return reject(err); });
                }
                else {
                    addData(index, promise);
                }
            });
        });
    };
    /**
     *
     * @param promises 实现race 的方法
     * @returns
     */
    MyPromise.race = function (promises) {
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
        return new Promise(function (resolve, reject) {
            promises.forEach(function (promise) {
                if (promise instanceof MyPromise) {
                    promise.then(function (res) {
                        resolve(res);
                    }, function (err) {
                        reject(err);
                    });
                }
                else {
                    resolve(promise);
                }
            });
        });
    };
    /**
     *
     * @param promises 实现AllSettled方法
     * @returns
     */
    MyPromise.allSettled = function (promises) {
        // 1. 接收一个Promise数组，数组中如有非Promise项，则此项当做成功；
        // 2. 把每一个Promise的结果，集合成数组后返回；
        return new MyPromise(function (resolve) {
            var results = [];
            var count = 0;
            promises.forEach(function (promise, index) {
                Promise.resolve(promise)
                    .then(function (value) {
                    results[index] = { status: "fulfilled", value: value };
                })
                    .catch(function (reason) {
                    results[index] = { status: "rejected", reason: reason };
                })
                    .finally(function () {
                    count++;
                    if (count === promises.length)
                        resolve(results);
                });
            });
        });
    };
    /**
     *
     * @param promises 实现 any 方法
     * @returns
     */
    MyPromise.any = function (promises) {
        var errors = [];
        // 1. 接收一个Promise数组，数组中如有非Promise项，则此项当做成功；
        // 2. 如果有一个Promise成功，则返回这个成功结果；
        // 3. 如果所有Promise都失败，则报错；
        return new Promise(function (resolve, reject) {
            promises.forEach(function (promise) {
                Promise.resolve(promise)
                    .then(function (value) {
                    resolve(value);
                })
                    .catch(function (reason) {
                    errors.push(reason);
                    if (errors.length === promises.length)
                        reject(errors);
                });
            });
        });
    };
    return MyPromise;
}());
// 测试下
var test3 = new MyPromise(function (res, rej) {
    res(100); //
}).then(function (res) { return console.log("success", res); }, function (err) { return console.log("fail", err); });
var test4 = new MyPromise(function (resolve, reject) {
    resolve(100);
})
    .then(function (res) { return new MyPromise(function (resolve, reject) { return reject(2 * res); }); }, function (err) { return new MyPromise(function (reslove, reject) { return reslove(3 * err); }); })
    .then(function (res) { return console.log("success", res); }, function (err) { return console.log("fail", err); });
