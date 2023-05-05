<!--
 * @Description: 浏览器事件模型&请求
-->

# 浏览器事件模型
## DOM事件
        1. DOM事件：针对html文档和xml文档的APi。Dom描述层次化的节点树，允许crud某一部分。
        2. DOM0级事件，事件就是用户或浏览器自身执行的某种操作，如click、load、mouseover，而相应某个事件的函数
           就被称作事件处理程序。
        3. click事件过程 -> 浏览器发现用户点击按钮时，浏览器就检测btn.onclick是否有值，若有值则执行。
        4. DOM1级事件
                DOM级别1于1998年10月1日成为W3C推荐标准。1级DOM标准中并没有定义事件相关的内容，所以没有所
                谓的1级DOM事件模型。在2级DOM中除了定义了一些DOM相关的操作之外还定义了一个事件模型 ，这个标准下的事件模型就是我们所说的2级DOM事件模型。
        5. DOM2级事件
                W3C将DOM1升级为DOM2,DOM2级规范尝试以一种符合逻辑的方式标准化DOM事件。定义两个方法，用于处理指定和删除事件处理程序，addEventListener()和removeEventListener(),接收3个参数。
                1. 要处理的事件名；
                2. 作为事件处理程序的函数；
                3. 布尔值，true 代表在捕获阶段调用事件处理程序，false 表示在冒泡阶段调用事件处理程序，默认为 false；
```js
        btn.addEventListener('click',function(){
        //  do something
        })
        btn.addEventListener('click',function(){
        //  do something else
        })
```
## 事件捕获&事件冒泡
     包括三个阶段：
        ● 事件捕获阶段；
        ● 处于目标阶段；
        ● 事件冒泡阶段；
      1、当处于目标阶段，没有捕获与冒泡之分，执行顺序会按照addEventListener的添加顺序决定，先添加先执行；
      2、使用stopPropagation()取消事件传播时，事件不会被传播给下一个节点，但是，同一节点上的其他listener
         还是会被执行；如果想要同一层级的listener也不执行，可以使用stopImmediatePropagation()；  
      3、preventDefault()只是阻止默认行为，跟JS的事件传播一点关系都没有；
      4、一旦发起了preventDefault()，在之后传递下去的事件里面也会有效果；
## 事件对象
        DOM0和DOM2的事件处理程序都会自动传入event对象
        IE中的event对象取决于指定的事件处理程序的方法。
        IE的handler会在全局作用域运行，this === window，所以在IE中会有window.event、event两种情况，只有在事件处理程序期间，event对象才会存在，一旦事件处理程序执行完成，event对象就会被销毁
        event对象里需要关心的两个属性：
        1. target：target永远是被添加了事件的那个元素；
        2. eventPhase：调用事件处理程序的阶段，有三个值
                1：捕获阶段；
                2：处于目标；
                3：冒泡阶段；

### preventDefault 与stopPropagation 
        preventDefault：比如链接被点击会导航到其href指定的URL，这个就是默认行为；
        stopPropagation：立即停止事件在DOM层次中的传播，包括捕获和冒泡事件；
## 事件委托
        事件委托：用来解决事件处理程序过多的问题
        