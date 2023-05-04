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
### 全局function 模式
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

