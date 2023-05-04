<!--
 * @Description: 前端模块化
-->

# 前端模块化

## 模块化的理解

     发展概述：发展初期 JS只是为了实现简单的页面交互逻辑 目前cpu 浏览器性能能到极大的提升，很多层面
     逻辑迁移到客户端，前端逐渐的变得复杂起来，遂开始使用模块化的规范的来去管理。总结起来主要解决的问
     有三个：
        1. 外部模块的管理
        2. 内部代码的组织
        3. 模块源码到目标代码的编译和转换

     一般模块是指将复杂程序依据一定的规则封装成几个快，且进行组合在一起
     块的内部数据与实现为私有化，只向外部暴露接口方法与外部其他模块进行
     通信。

## 模块化的进程

### 全局 function 模式

     将不同的功能封装为不同的全局函数
     1. 编码： 将不同的功能封装成不同的全局函数
     2. 问题：污染全局命名空间, 容易引起命名冲突或数据不安全，而且模块成员之间看不出直接关系

### namespace 模式

     对象封装
     作用：减少全局变量，可解决命名冲突
     问题：数据安全性不高 可以外部直接修改内部数据

        ```js
        let myModule = {
        data: 'www.baidu.com',
        foo() {
        console.log(`foo() ${this.data}`)
        },
        bar() {
        console.log(`bar() ${this.data}`)
        }
        }
        myModule.data = 'other data' //能直接修改模块内部的数据
        myModule.foo() // foo() other data
        ```

### IIFE 模式

       匿名函数自调用（闭包）
        ● 作用：数据是私有的, 外部只能通过暴露的方法操作
        ● 编码：将数据和行为封装到一个函数内部, 通过给window添加属性来向外暴露接口
        ● 问题：如果当前这个模块依赖另一个模块怎么办?

        ``` html
        // index.html文件
        <script type="text/javascript" src="module.js"></script>
        <script type="text/javascript">
        myModule.foo()
        myModule.bar()
        console.log(myModule.data) //undefined 不能访问模块内部数据
        myModule.data = 'xxxx' //不是修改的模块内部的data
        myModule.foo() //没有改变
        </script>

        // module.js文件
        (function(window) {
        let data = 'www.xianzao.com'
        //操作数据的函数
        function foo() {
        //用于暴露有函数
        console.log(`foo() ${data}`)
        }
        function bar() {
        //用于暴露有函数
        console.log(`bar() ${data}`)
        otherFun() //内部调用
        }
        function otherFun() {
        //内部私有的函数
        console.log('otherFun()')
        }
        //暴露行为
        window.myModule = { foo, bar } //ES6写法
        })(window)
        ```

## 模块化的好处

        ● 避免命名冲突(减少命名空间污染)；
        ● 更好的分离, 按需加载；
        ● 更高复用性；
        ● 高可维护性；

# 模块化的规范

## cjs

     概念->
     node由模块组成，采用cjs 模块规范，每个文件就是一个模块，且有属于自己的作用域。在一个文件里面
     定义变量、函数、类、都是私有的，对其他文件不可见、服务器端，模块加载是运行时同步加载；在浏览器
     端，模块需要提前编译打包处理。

     特点->
     ● 所有代码都运行在模块作用域，不会污染全局作用域；
     ● 模块可以多次加载，但是只会在第一次加载时运行一次，然后运行结果就被缓存了，以后再加载，就直接读取缓存结果。
       要想让模块再次运行，必须清除缓存；
     ● 模块加载的顺序，按照其在代码中出现的顺序;

     语法->
     暴露模块：module.exports = value 或者exports.xxx = value;
     引入模块：require(xxx),如果是第三方模块，xxx 为模块名，如果是自定义模块，xxx为模块文件路径
     cjs暴露的模块到底是什么 ? cjs 规范规定，每个模块内部，module变量代表当前模块，这个变量是一个对象，它的export属性(即module.exports)是对外的接口，加载某个模块，其实是加载该模块的module.exports属性

## 模块加载机制

     cjs模块加载机制 输入的是被输出的值的拷贝。也就是说 输出一个值，模块内部的变化就影响不到这个值。

          ``` js
          // lib.js
          var counter = 3;
          function incCounter() {
          counter++;
          }
          module.exports = {
          counter: counter,
          incCounter: incCounter,
          };

          // main.js

          var counter = require('./lib').counter;
          var incCounter = require('./lib').incCounter;

          console.log(counter); // 3
          incCounter();
          console.log(counter); // 3

          ```
     上边代码说明，counter 输出以后,lib.js 模块内部的变化就影响不到counter，
     因为counter是一个基本数据类型的值会被缓存，除非写成一个函数，才能得到内部变化后
     的值。

# AMD实现

## 概念
     cjs 规范加载模块是同步的，也就是说，只有加载完成，才能执行后边的操作，AMD规范是非同步
     加载模块，允许指定回调函数，由于node.js主要用于服务端编程，模块文件一般都已经存在于本地硬盘，所以加载起来比较快，不用考虑非同步加载的方式，所以CommonJS规范比较适用。但是，如果是浏览器环境，要从服务器端加载模块，这时就必须采用非同步模式，因此浏览器端一般采用AMD规范。此外AMD规范比CommonJS规范在浏览器端实现要来着早

## 基本语法
     定义暴露模块

          ``` js
          //定义没有依赖的模块
          define(function(){
          return 模块
          })

          //定义有依赖的模块
          define(['module1', 'module2'], function(m1, m2){
          return 模块
          })


          require(['module1', 'module2'], function(m1, m2){
          //    使用m1/m2
          })
```
## 使用require.js

     RequireJS是一个工具库，主要用于客户端的模块管理，它的模块管理遵守AMD规范
     RequireJS 的基本思路是通过define方法 将代码定义为模块通过require方法实现
     代码的模块加载。

     了解AMD规范在浏览器实现的步骤：
          1. 下载require.js并且引入
          ● 官网: http://www.requirejs.cn/
          ● github : https://github.com/requirejs/requirejs
     然后将require.js导入项目: js/libs/require.js
          2.创建项目结构
``` js
|-js
  |-libs
    |-require.js
  |-modules
    |-alerter.js
    |-dataService.js
  |-main.js
|-index.html
```
          3.定义require.js的模块代码
```js 
// dataService.js文件
// 定义没有依赖的模块
define(function() {
  let msg = 'www.xianzao.com'
  function getMsg() {
    return msg.toUpperCase()
  }
  return { getMsg } // 暴露模块
})

//alerter.js文件
// 定义有依赖的模块
define(['dataService'], function(dataService) {
  let name = 'xianzao'
  function showMsg() {
    alert(dataService.getMsg() + ', ' + name)
  }
  // 暴露模块
  return { showMsg }
})

// main.js文件
(function() {
  require.config({
    baseUrl: 'js/', //基本路径 出发点在根目录下
    paths: {
      //映射: 模块标识名: 路径
      alerter: './modules/alerter', //此处不能写成alerter.js,会报错
      dataService: './modules/dataService'
    }
  })
  require(['alerter'], function(alerter) {
    alerter.showMsg()
  })
})()

// index.html文件
<!DOCTYPE html>
<html>
  <head>
    <title>Modular Demo</title>
  </head>
  <body>
    <!-- 引入require.js并指定js主文件的入口 -->
    <script data-main="js/main" src="js/libs/require.js"></script>
  </body>
</html>
```

          4. 页面引入require.js 文件
```js
<script data-main="js/main" src="js/libs/require.js"></script>
```
          5.引入第三方库
```js
// alerter.js文件
define(['dataService', 'jquery'], function(dataService, $) {
  let name = 'Tom'
  function showMsg() {
    alert(dataService.getMsg() + ', ' + name)
  }
  $('body').css('background', 'green')
  // 暴露模块
  return { showMsg }
})


// main.js文件
(function() {
  require.config({
    baseUrl: 'js/', //基本路径 出发点在根目录下
    paths: {
      //自定义模块
      alerter: './modules/alerter', //此处不能写成alerter.js,会报错
      dataService: './modules/dataService',
      // 第三方库模块
      jquery: './libs/jquery-1.10.1' //注意：写成jQuery会报错
    }
  })
  require(['alerter'], function(alerter) {
    alerter.showMsg()
  })
})()

```

### 总结
 通过两者的比较，可以得出AMD模块定义的方法非常清晰，不会污染全局环境，能够清楚地显示依赖关系。AMD模式可以用于浏览器环境，并且允许非同步加载模块，也可以根据需要动态加载模块。


