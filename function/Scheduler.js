/*
 * @Description: 实现一个带并发限制的异步调度器 Scheduler，
                保证同时运行的任务最多有N个。
                完善下面代码中的 Scheduler 类，使得以下程序能正确输出：
 */
// class Scheduler {
//         add(promiseCreator) { ... }
//         // ...
//       }
//       const timeout = (time) => new Promise(resolve => {
//         setTimeout(resolve, time)
//       })
//       const scheduler = new Scheduler(n)
//       const addTask = (time, order) => {
//         scheduler.add(() => timeout(time)).then(() => console.log(order))
//       }
//       addTask(1000, '1')
//       addTask(500, '2')
//       addTask(300, '3')
//       addTask(400, '4')
// 打印顺序是：2 3 1 4
var Scheduler = /** @class */ (function () {
    function Scheduler(concurrency) {
        this.concurrency = concurrency;
        this.tasks = []; // 维护一个任务队列
        this.runningCount = 0; // 定义一个计数器
    }
    Scheduler.prototype.add = function (promiseCreator) {
        var _this = this;
        return new Promise(function (resolve) {
            _this.tasks.push(function () { return promiseCreator().then(resolve); });
            _this.runTasks();
        });
    };
    Scheduler.prototype.runTasks = function () {
        var _this = this;
        // 循环判断 当前任务 数量是否已经达到 并发的请求 若是没有 则从任务队列取出一个任务
        // 且使用Promise的Finally方法
        // 在任务完成递减计数器 递归调用runtasks方法 若达到 限制 则不再继续运行任务。
        while (this.runningCount < this.concurrency && this.tasks.length > 0) {
            var task = this.tasks.shift();
            // 判断是否task 存在
            if (task)
                task().finally(function () {
                    _this.runningCount--;
                    _this.runTasks();
                });
            this.runningCount++;
        }
    };
    return Scheduler;
}());
var timeout = function (time) { return new Promise(function (res) { return setTimeout(res, time); }); };
var scheduler = new Scheduler(2);
var addTask = function (time, order) {
    return scheduler.add(function () { return timeout(time).then(function () { return console.log("order", order); }); });
};
addTask(1000, "1");
addTask(500, "2");
addTask(300, "3");
addTask(400, "4");
