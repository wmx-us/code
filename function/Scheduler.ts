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

class Scheduler {
  private tasks: Array<() => Promise<any>> = []; // 维护一个任务队列
  private runningCount = 0; // 定义一个计数器
  constructor(private concurrency: number) {}

  add(promiseCreator: () => Promise<any>) {
    return new Promise((resolve) => {
      this.tasks.push(() => promiseCreator().then(resolve));
      this.runTasks();
    });
  }
  private runTasks() {
    // 循环判断 当前任务 数量是否已经达到 并发的请求 若是没有 则从任务队列取出一个任务
    // 且使用Promise的Finally方法
    // 在任务完成递减计数器 递归调用runtasks方法 若达到 限制 则不再继续运行任务。
    while (this.runningCount < this.concurrency && this.tasks.length > 0) {
      const task = this.tasks.shift();
      // 判断是否task 存在
      if (task)
        task().finally(() => {
          this.runningCount--;
          this.runTasks();
        });
      this.runningCount++;
    }
  }
}

const timeout = (time: number) => new Promise((res) => setTimeout(res, time));
const scheduler = new Scheduler(2);
const addTask = (time: number, order: string) =>
  scheduler.add(() => timeout(time).then(() => console.log("order", order)));

addTask(1000, "1");
addTask(500, "2");
addTask(300, "3");
addTask(400, "4");
