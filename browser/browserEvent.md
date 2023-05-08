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
# 浏览器的网络请求
        在浏览器端发送网络请求的常见方式：
        1. Ajax 2. fetch 3.axios;

## ajax
        1. 通过XMLHttpRequest 构造函数创建异步对象xmlHttp, Ie5,Ie6 使用ActiveXObject创建。
        1. onreadystatechange：监听异步对象请求状态码readyState的改变，每当readyState改变时，就会触发onreadystatechange事件；
        2. readyState：请求状态码readyState表示异步对象目前的状态，状态码从0到4：
                0: 表示请求未初始化，还没有调用 open()；
                1: 服务器连接已建立，但是还没有调用 send()；
                2: 请求已接收，正在处理中（通常现在可以从响应中获取内容头）；
                3: 请求处理中，通常响应中已有部分数据可用了，没有全部完成；
                4: 当readyState状态码为4时，表示请求已完成；此阶段确认全部数据都已经解析完毕，可以通过异步对象的属性获取对应数据；
                3. status：http状态码
                http状态码表示成功的http状态码有
                xmlHttp.status >= 200 && xmlHttp.status < 300 || xmlHttp.status == 304
                4. responseText：后台返回的字符串形式的响应数据；
                5. responseXML：后台返回的XML形式的响应数据；
        设置请求方式和请求地址
        xmlHttp.open("GET/POST","ajax-get.txt",true)
                第一个参数：请求的类型；GET 还是 POST；
                第二个参数：表示请求的文件的地址url；
                第三个参数：设置请求方法是不是异步async，true为异步， false为同步。AJAX存在的意义就是发异步请求，所以第三个参数永远传true；
                
        ** 处理IE浏览器缓存问题：
           一般情况下Ajax发送的get请求，如果url相同那么只有一个结果，地址未发生改变，它就会把上一次的结果直接返回，导致不能
           实时的拿到最新的变化数据
           处理解决方案：
                1. Math.random();
                2. new Data().getTime()

                在请求地址的后边拼接随机数或者当前时间的时间戳。
```js
const ajax = option => {
  //type, url, data, timeout, success, error将所有参数换成一个对象{}

  //  0.将对象转换成字符串

  //处理obj
  const objToString = data => {
    data.t = new Date().getTime();
    let res = [];
    for (let key in data) {
      //需要将key和value转成非中文的形式，因为url不能有中文。使用encodeURIComponent();
      res.push(encodeURIComponent(key) + ' = ' + encodeURIComponent(data[key]));
    }
    return res.join('&');
  };

  let str = objToString(option.data || {});

  //  1.创建一个异步对象xmlHttp；
  var xmlHttp, timer;
  if (window.XMLHttpRequest) {
    xmlHttp = new XMLHttpRequest();
  } else if (xmlHttp) {
    // code for IE6, IE5
    xmlHttp = new ActiveXObject('Microsoft.xmlHttp');
  }

  //  2.设置请求方式和请求地址；
  // 判断请求的类型是POST还是GET
  if (option.type.toLowerCase() === 'get') {
    xmlHttp.open(option.type, option.url + '?t=' + str, true);
    //  3.发送请求；
    xmlHttp.send();
  } else {
    xmlHttp.open(option.type, option.url, true);
    // 注意：在post请求中，必须在open和send之间添加HTTP请求头：setRequestHeader(header,value);
    xmlHttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    //  3.发送请求；
    xmlHttp.send(str);
  }

  //  4.监听状态的变化；
  xmlHttp.onreadystatechange = function () {
    clearInterval(timer);
    debugger;
    if (xmlHttp.readyState === 4) {
      if ((xmlHttp.status >= 200 && xmlHttp.status < 300) || xmlHttp.status == 304) {
        //  5.处理返回的结果；
        option.success(xmlHttp.responseText); //成功后回调；
      } else {
        option.error(xmlHttp.responseText); //失败后回调；
      }
    }
  };

  //判断外界是否传入了超时时间
  if (option.timeout) {
    timer = setInterval(function () {
      xmlHttp.abort(); //中断请求
      clearInterval(timer);
    }, option.timeout);
  }
};
```


## fetch

        fetch ES6 出现的，使用ES6 提出的Promise对象。
        fetch 与Ajax 一般有三个差异：
          1. fetch采用promise，不使用Cb 函数，简化写法，简洁。
          2. fetch采用模块化设计，API分散在多个对象，更合理，
          3. fetch通过数据流处理数据，分块读取，提高网站的性能表现，减少内存占比，对请求大文件或者网站速度慢场景很有用。

        ```js 
           fetch('https://api.github.com/users/ruanyf')
                .then(response => response.json())
                .then(json => console.log(json))
                .catch(err => console.log('Request Failed', err)); 
        ```
        fetch 接收response 是一个stream对象，response.json()异步操作，取出所有的内容，且将其转为JSON对象。
        asynchronous await 写法


        ```js
        async function getJSON() {
          let url = 'https://api.github.com/users/ruanyf';
          try {
                let response = await fetch(url);
                 return await response.json();
              }
          catch (error) {
                 console.log('Request Failed', error);
             }
        }
        ```

        请求成功后Response包含的数据通过Stream接口异步读取，但是它还包含一些同步属性，对应 HTTP 回应的标头信息（Headers），
        可以立即读取。
        1. Response.ok
        Response.ok属性返回一个布尔值，表示请求是否成功，true对应 HTTP 请求的状态码 200 到 299，false对应其他的状态码；
        2. Response.status
        Response.status属性返回一个数字，表示 HTTP 回应的状态码（例如200，表示成功请求）；
        3. Response.statusText
        Response.statusText属性返回一个字符串，表示 HTTP 回应的状态信息（例如请求成功以后，服务器返回"OK"）；
        4. Response.url
        Response.url属性返回请求的 URL。如果 URL 存在跳转，该属性返回的是最终 URL；
        5. Response.type
        Response.type属性返回请求的类型。可能的值如下：
        ● basic：普通请求，即同源请求；
        ● cors：跨域请求；
        ● error：网络错误，主要用于 Service Worker；
        ● opaque：如果fetch()请求的type属性设为no-cors，就会返回这个值。表示发出的是简单的跨域请求，类似<form>表单的那种跨域请求；
        ● opaqueredirect：如果fetch()请求的redirect属性设为manual，就会返回这个值；
        6. Response.redirected
        Response.redirected属性返回一个布尔值，表示请求是否发生过跳转。

        Headers 对象可以使用for...of 循环遍历


        ```js
                const response = await fetch(url);

                for (let [key, value] of response.headers) { 
                        console.log(`${key} : ${value}`);  
                }

                // 或者
                for (let [key, value] of response.headers.entries()) { 
                        console.log(`${key} : ${value}`);  
                }
        ```

        Headers 对象 提供以下对象用来操作标头

        ```js
                Headers.get()：根据指定的键名，返回键值。
                Headers.has()： 返回一个布尔值，表示是否包含某个标头。
                Headers.set()：将指定的键名设置为新的键值，如果该键名不存在则会添加。
                Headers.append()：添加标头。
                Headers.delete()：删除标头。
                Headers.keys()：返回一个遍历器，可以依次遍历所有键名。
                Headers.values()：返回一个遍历器，可以依次遍历所有键值。
                Headers.entries()：返回一个遍历器，可以依次遍历所有键值对（[key, value]）。
                Headers.forEach()：依次遍历标头，每个标头都会执行一次参数函数。
        ```

        读取内容的方法
        Response对象根据服务器返回的不同类型的数据，提供了不同的读取方法。
                ● response.text()：得到文本字符串；
                ● response.json()：得到 JSON 对象；
                ● response.blob()：得到二进制 Blob 对象；
                ● response.formData()：得到 FormData 表单对象；
                ● response.arrayBuffer()：得到二进制 ArrayBuffer 对象

        定制Http请求 fetch()的第一个参数是 URL，还可以接受第二个参数，作为配置对象，定制发出的 HTTP 请求
        fetch(url, optionObj)
### Post请求
```js
const response = await fetch(url, {
  method: 'POST',
  headers: {
    "Content-type": "application/x-www-form-urlencoded; charset=UTF-8",
  },
  body: 'foo=bar&lorem=ipsum',
});

const json = await response.json();
```
### 提交 JSON 数据
```js
const user =  { name:  'John', surname:  'Smith'  };
const response = await fetch('/article/fetch/post/user', {
  method: 'POST',
  headers: {
   'Content-Type': 'application/json;charset=utf-8'
  }, 
  body: JSON.stringify(user) 
});
```
### 提交表单
```js
const form = document.querySelector('form');

const response = await fetch('/users', {
  method: 'POST',
  body: new FormData(form)
})
```
### 文件上传
```js
const input = document.querySelector('input[type="file"]');

const data = new FormData();
data.append('file', input.files[0]);
data.append('user', 'foo');

fetch('/avatars', {
  method: 'POST',
  body: data
});
```
### 直接上传二进制数据
```js
let blob = await new Promise(resolve =>   
  canvasElem.toBlob(resolve,  'image/png')
);

let response = await fetch('/article/fetch/post/image', {
  method:  'POST',
  body: blob
});
```
### option API 
        fetch 第二个参数完整API
```js
const response = fetch(url, {
  method: "GET",
  headers: {
    "Content-Type": "text/plain;charset=UTF-8"
  },
  body: undefined,
  referrer: "about:client",
  referrerPolicy: "no-referrer-when-downgrade",
  mode: "cors", 
  credentials: "same-origin",
  cache: "default",
  redirect: "follow",
  integrity: "",
  keepalive: false,
  signal: undefined
});
```
#### cache
cache属性指定如何处理缓存。可能的取值如下：
● default：默认值，先在缓存里面寻找匹配的请求；
● no-store：直接请求远程服务器，并且不更新缓存；
● reload：直接请求远程服务器，并且更新缓存；
● no-cache：将服务器资源跟本地缓存进行比较，有新的版本才使用服务器资源，否则使用缓存；
● force-cache：缓存优先，只有不存在缓存的情况下，才请求远程服务器；
● only-if-cached：只检查缓存，如果缓存里面不存在，将返回504错误；
#### mode
mode属性指定请求的模式。可能的取值如下：
● cors：默认值，允许跨域请求；
● same-origin：只允许同源请求；
● no-cors：请求方法只限于 GET、POST 和 HEAD，并且只能使用有限的几个简单标头，
不能添加跨域的复杂标头，相当于提交表单所能发出的请求；
#### credentials
credentials属性指定是否发送 Cookie。可能的取值如下：
● same-origin：默认值，同源请求时发送 Cookie，跨域请求时不发送；
● include：不管同源请求，还是跨域请求，一律发送 Cookie；
● omit：一律不发送；
跨域请求发送 Cookie，需要将credentials属性设为include。
#### signal
signal属性指定一个 AbortSignal 实例，用于取消fetch()请求。
#### keepalive
keepalive属性用于页面卸载时，告诉浏览器在后台保持连接，继续发送数据。
一个典型的场景就是，用户离开网页时，脚本向服务器提交一些用户行为的统计信息。这时，
如果不用keepalive属性，数据可能无法发送，因为浏览器已经把页面卸载了。
#### redirect
redirect属性指定 HTTP 跳转的处理方法。可能的取值如下：
● follow：默认值，fetch()跟随 HTTP 跳转；
● error：如果发生跳转，fetch()就报错；
● manual：fetch()不跟随 HTTP 跳转，但是response.url属性会指向新的 URL，
  response.redirected属性会变为true，由开发者自己决定后续如何处理跳转；
#### integrity
integrity属性指定一个哈希值，用于检查 HTTP 回应传回的数据是否等于这个预先设定的哈希值。
比如，下载文件时，检查文件的 SHA-256 哈希值是否相符，确保没有被篡改。

#### referrer
referrer属性用于设定fetch()请求的referer标头。
这个属性可以为任意字符串，也可以设为空字符串（即不发送referer标头）。
#### referrerPolicy

referrerPolicy属性用于设定Referer标头的规则。可能的取值如下：
● no-referrer-when-downgrade：默认值，总是发送Referer标头，除非从 HTTPS 页面请求 HTTP 资源时不发送；
● no-referrer：不发送Referer标头；
● origin：Referer标头只包含域名，不包含完整的路径；
● origin-when-cross-origin：同源请求Referer标头包含完整的路径，跨域请求只包含域名；
● same-origin：跨域请求不发送Referer，同源请求发送；
● strict-origin：Referer标头只包含域名，HTTPS 页面请求 HTTP 资源时不发送Referer标头；
● strict-origin-when-cross-origin：同源请求时Referer标头包含完整路径，跨域请求时只包含域名，
  HTTPS 页面请求 HTTP 资源时不发送该标头；
● unsafe-url：不管什么情况，总是发送Referer标头；

#### fetch cancel
fetch()请求发送以后，如果中途想要取消，需要使用AbortController对象。

```js

let controller = new AbortController();
let signal = controller.signal;

fetch(url, {
  signal: controller.signal
});

signal.addEventListener('abort',
  () => console.log('abort!')
);

controller.abort(); // 取消

console.log(signal.aborted); // true
```
上面示例中，首先新建 AbortController 实例，然后发送fetch()请求，
配置对象的signal属性必须指定接收 AbortController 实例发送的信号controller.signal。
controller.abort()方法用于发出取消信号。这时会触发abort事件，这个事件可以监听，
也可以通过controller.signal.aborted属性判断取消信号是否已经发出
```js
// 一秒之后取消请求
let controller = new AbortController();
setTimeout(() => controller.abort(), 1000);

try {
  let response = await fetch('/long-operation', {
    signal: controller.signal
  });
} catch(err) {
  if (err.name == 'AbortError') {
    console.log('Aborted!');
  } else {
    throw err;
  }
}
```
## axios 
基于Ajax封装的第三方库 
```js
// 完整的配置
{
   // `url` 是用于请求的服务器 URL
  url: '/user',
  // `method` 是创建请求时使用的方法
  method: 'get', // default
  // `baseURL` 将自动加在 `url` 前面，除非 `url` 是一个绝对 URL。
  // 它可以通过设置一个 `baseURL` 便于为 axios 实例的方法传递相对 URL
  baseURL: 'https://some-domain.com/api/',
  // `transformRequest` 允许在向服务器发送前，修改请求数据
  // 只能用在 'PUT', 'POST' 和 'PATCH' 这几个请求方法
  // 后面数组中的函数必须返回一个字符串，或 ArrayBuffer，或 Stream
  transformRequest: [function (data, headers) {
    // 对 data 进行任意转换处理
    return data;
  }],
  // `transformResponse` 在传递给 then/catch 前，允许修改响应数据
  transformResponse: [function (data) {
    // 对 data 进行任意转换处理
    return data;
  }],
  // `headers` 是即将被发送的自定义请求头
  headers: {'X-Requested-With': 'XMLHttpRequest'},
  // `params` 是即将与请求一起发送的 URL 参数
  // 必须是一个无格式对象(plain object)或 URLSearchParams 对象
  params: {
    ID: 12345
  },
   // `paramsSerializer` 是一个负责 `params` 序列化的函数
  // (e.g. https://www.npmjs.com/package/qs, http://api.jquery.com/jquery.param/)
  paramsSerializer: function(params) {
    return Qs.stringify(params, {arrayFormat: 'brackets'})
  },
  // `data` 是作为请求主体被发送的数据
  // 只适用于这些请求方法 'PUT', 'POST', 和 'PATCH'
  // 在没有设置 `transformRequest` 时，必须是以下类型之一：
  // - string, plain object, ArrayBuffer, ArrayBufferView, URLSearchParams
  // - 浏览器专属：FormData, File, Blob
  // - Node 专属： Stream
  data: {
    firstName: 'Fred'
  },
  // `timeout` 指定请求超时的毫秒数(0 表示无超时时间)
  // 如果请求话费了超过 `timeout` 的时间，请求将被中断
  timeout: 1000,
   // `withCredentials` 表示跨域请求时是否需要使用凭证
  withCredentials: false, // default
  // `adapter` 允许自定义处理请求，以使测试更轻松
  // 返回一个 promise 并应用一个有效的响应 (查阅 [response docs](#response-api)).
  adapter: function (config) {
    /* ... */
  },
 // `auth` 表示应该使用 HTTP 基础验证，并提供凭据
  // 这将设置一个 `Authorization` 头，覆写掉现有的任意使用 `headers` 设置的自定义 `Authorization`头
  auth: {
    username: 'janedoe',
    password: 's00pers3cret'
  },
   // `responseType` 表示服务器响应的数据类型，可以是 'arraybuffer', 'blob', 'document', 'json', 'text', 'stream'
  responseType: 'json', // default
  // `responseEncoding` indicates encoding to use for decoding responses
  // Note: Ignored for `responseType` of 'stream' or client-side requests
  responseEncoding: 'utf8', // default
   // `xsrfCookieName` 是用作 xsrf token 的值的cookie的名称
  xsrfCookieName: 'XSRF-TOKEN', // default
  // `xsrfHeaderName` is the name of the http header that carries the xsrf token value
  xsrfHeaderName: 'X-XSRF-TOKEN', // default
   // `onUploadProgress` 允许为上传处理进度事件
  onUploadProgress: function (progressEvent) {
    // Do whatever you want with the native progress event
  },
  // `onDownloadProgress` 允许为下载处理进度事件
  onDownloadProgress: function (progressEvent) {
    // 对原生进度事件的处理
  },
   // `maxContentLength` 定义允许的响应内容的最大尺寸
  maxContentLength: 2000,
  // `validateStatus` 定义对于给定的HTTP 响应状态码是 resolve 或 reject  promise 。如果 `validateStatus` 返回 `true` (或者设置为 `null` 或 `undefined`)，promise 将被 resolve; 否则，promise 将被 rejecte
  validateStatus: function (status) {
    return status >= 200 && status < 300; // default
  },
  // `maxRedirects` 定义在 node.js 中 follow 的最大重定向数目
  // 如果设置为0，将不会 follow 任何重定向
  maxRedirects: 5, // default
  // `socketPath` defines a UNIX Socket to be used in node.js.
  // e.g. '/var/run/docker.sock' to send requests to the docker daemon.
  // Only either `socketPath` or `proxy` can be specified.
  // If both are specified, `socketPath` is used.
  socketPath: null, // default
  // `httpAgent` 和 `httpsAgent` 分别在 node.js 中用于定义在执行 http 和 https 时使用的自定义代理。允许像这样配置选项：
  // `keepAlive` 默认没有启用
  httpAgent: new http.Agent({ keepAlive: true }),
  httpsAgent: new https.Agent({ keepAlive: true }),
  // 'proxy' 定义代理服务器的主机名称和端口
  // `auth` 表示 HTTP 基础验证应当用于连接代理，并提供凭据
  // 这将会设置一个 `Proxy-Authorization` 头，覆写掉已有的通过使用 `header` 设置的自定义 `Proxy-Authorization` 头。
  proxy: {
    host: '127.0.0.1',
    port: 9000,
    auth: {
      username: 'mikeymike',
      password: 'rapunz3l'
    }
  },
  // `cancelToken` 指定用于取消请求的 cancel token
  // （查看后面的 Cancellation 这节了解更多）
  cancelToken: new CancelToken(function (cancel) {
  })
}
```
## 区别
        1. Ajax 是Async Javascript And Xml的简称，它是原生JavaScript的一种请求方案，利用 
        XMLHttpRequest 进行异步请求数据，实现无感刷新数据；
        2. Fetch 是 ES6 新推出的一套异步请求方案，它天生自带 Promise，同时也是原生的，
        如果在较小项目中为了项目大小着想和兼容性不是那么高的前提下不妨可以用它来进行异步请求也是不错的；
        3. Axios 是基于 Ajax 和 Promise 封装的一个库，可以利用Promise来更好的管控请求回调嵌套造成的回调地狱；
