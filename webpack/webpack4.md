#  webpack
## webpack优化
### 1. 缩小文件搜索范围
        Webpack 启动后会从配置的Entry出发，解析出文件中的导入语句，递归解析。
        遇导入语句会做两件事：
        a. 根据导入语句去寻找对应的要导入的文件。
        b. 根据找到的导入文件后缀，使用配置的loader 去处理文件。

### 2.优化loader配置
        由于Loader 对文件转化操作很耗时，需要让尽可能的文件被Loader处理。
        且适当的调整项目的目录结构，方便再配置Loader 通过include去缩小命中范围。

        在使用 Loader 时可以通过 test 、 include 、 exclude 三个配置项来命中 Loader 要应用规则的文件。 为了尽可能少的让文件被 Loader 处理，可以通过 include 去命中只有哪些文件需要被处理。

```js
module.exports = {
  module: {
    rules: [
      {
        // 如果项目源码中只有 js 文件就不要写成 /\.jsx?$/，提升正则表达式性能
        test: /\.js$/,
        // babel-loader 支持缓存转换出的结果，通过 cacheDirectory 选项开启
        use: ['babel-loader?cacheDirectory'],
        // 只对项目根目录下的 src 目录中的文件采用 babel-loader
        include: path.resolve(__dirname, 'src'),
      },
    ]
  },
};
```
#### 优化resolve.modules 配置
        resolve.modules 的默认值是 ['node_modules']，含义是先去当前目录下的 ./node_modules 目录下去找想找的模块，s
        如果没找到就去上一级目录 ../node_modules 中找，再没有就去 ../../node_modules 中找，以此类推，这和 Node.js 
        的模块寻找机制很相似。
        当安装的第三方模块都放在项目根目录下的 ./node_modules 目录下时，没有必要按照默认的方式去一层层的寻找，可以指
        明存放第三方模块的绝对路径，以减少寻找，配置如下：
```js
module.exports = {
  resolve: {
    // 使用绝对路径指明第三方模块存放的位置，以减少搜索步骤
    // 其中 __dirname 表示当前工作目录，也就是项目根目录
    modules: [path.resolve(__dirname, 'node_modules')]
  },
};
```
#### 优化resolve.alias 配置
        resolve.alias 配置项通过别名来把原导入路径映射成一个新的导入路径。
        在实战项目中经常会依赖一些庞大的第三方模块，以 React 库为例，安装到 node_modules 目录下的 React 库的目录结构如下：
```js
├── dist
│   ├── react.js
│   └── react.min.js
├── lib
│   ... 还有几十个文件被忽略
│   ├── LinkedStateMixin.js
│   ├── createClass.js
│   └── React.js
├── package.json
└── react.js
``` 
        一般来说发布出去的代码React库中包含两套代码：
                一套采用CJS规范的模块化代码，这些文件都放在lib目录下，以package.json中指定的入口文件react.js 为模块的入口，
                一套是把 React 所有相关的代码打包好的完整代码放到一个单独的文件中，这些代码没有采用模块化可以直接执行。其中 dist/react.js 是用于开发环境，里面包含检查和警告的代码。dist/react.min.js 是用于线上环境，被最小化了。
        默认情况下webpack 会从入口文件，开始递归解析和处理依赖的几十个文件，会有一个耗时操作，配置resolve.alias 可以让webpack在处理react库时，直接使用简单的react.min.js文件。

```js

module.exports = {
  resolve: {
    // 使用 alias 把导入 react 的语句换成直接使用单独完整的 react.min.js 文件，
    // 减少耗时的递归解析操作
    alias: {
      'react': path.resolve(__dirname, './node_modules/react/dist/react.min.js'), // react15
      // 'react': path.resolve(__dirname, './node_modules/react/umd/react.production.min.js'), // react16
    }
  },
};
```
### 3. 使用DLLPlugin 
#### DLL
在Windows系统中时常看到以.dll 为后缀的文件，这些文件成为动态链接库，在动态链接库中可以包含其他模块调用的函数和数据
web项目构建接入动态链接库的思想：
    网页基础模块抽离出来，打包一个个单独动态链库中去，一个动态链接库，可以包含多个模块
    需要导入的模块存在某个动态链接库时，当前模块不能被再次打包，而是从动态链接库中去获取
    页面依赖所有动态链接库需要被加载
    
web项目加入动态库，提升构建速度原因： 在于包含大量复用模块的动态链接库只需要编译一次，在之后构建过程中被动态链接库包含的模块不再重新编译，直接使用动态链接库链接中的代码，目前由于动态链接库中包含常用的第三方模块，例如react、react-dom，只要不升级这些版本模块，动态库不会重新编译。

接入webpack

webpack 本身内置对动态链接库的支持，需要通过两个内置插件接入， 分别是
    DLLPlugin（用于打包出一个单独的动态链接库文件）
    DLLReferencePlugin 插件（用于在主要配置文件中去引入 DllPlugin 插件打包好的动态链接库文件；）

构建出动态链接库文件，

      ```js
      ├── polyfill.dll.js
      ├── polyfill.manifest.json
      ├── react.dll.js
      └── react.manifest.json
      ├── main.js
      ```

是由两份不同的构建分别输出的
动态链接库的相关文件需要一份独立的构建文件，给主构建使用，新建一个配置webpack文件，webpack_dll.config.js 专门构建他们


```js
const path = require('path');
const DllPlugin = require('webpack/lib/DllPlugin');

module.exports = {
  // JS 执行入口文件
  entry: {
    // 把 React 相关模块的放到一个单独的动态链接库
    react: ['react', 'react-dom'],
    // 把项目需要所有的 polyfill 放到一个单独的动态链接库
    polyfill: ['core-js/fn/object/assign', 'core-js/fn/promise', 'whatwg-fetch'],
  },
  output: {
    // 输出的动态链接库的文件名称，[name] 代表当前动态链接库的名称，
    // 也就是 entry 中配置的 react 和 polyfill
    filename: '[name].dll.js',
    // 输出的文件都放到 dist 目录下
    path: path.resolve(__dirname, 'dist'),
    // 存放动态链接库的全局变量名称，例如对应 react 来说就是 _dll_react
    // 之所以在前面加上 _dll_ 是为了防止全局变量冲突
    library: '_dll_[name]',
  },
  plugins: [
    // 接入 DllPlugin
    new DllPlugin({
      // 动态链接库的全局变量名称，需要和 output.library 中保持一致
      // 该字段的值也就是输出的 manifest.json 文件 中 name 字段的值
      // 例如 react.manifest.json 中就有 "name": "_dll_react"
      name: '_dll_[name]',
      // 描述动态链接库的 manifest.json 文件输出时的文件名称
      path: path.join(__dirname, 'dist', '[name].manifest.json'),
    }),
  ],
};
```


#### 使用动态链接库文件

构建出的动态链接库文件用于给其他地方使用，给执行入口使用

用于输出mian.js 的主要webpack 配置文件内如如下：

```js

const path = require('path');
const DllReferencePlugin = require('webpack/lib/DllReferencePlugin');

module.exports = {
  entry: {
    // 定义入口 Chunk
    main: './main.js'
  },
  output: {
    // 输出文件的名称
    filename: '[name].js',
    // 输出文件都放到 dist 目录下
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        // 项目源码使用了 ES6 和 JSX 语法，需要使用 babel-loader 转换
        test: /\.js$/,
        use: ['babel-loader'],
        exclude: path.resolve(__dirname, 'node_modules'),
      },
    ]
  },
  plugins: [
    // 告诉 Webpack 使用了哪些动态链接库
    new DllReferencePlugin({
      // 描述 react 动态链接库的文件内容
      manifest: require('./dist/react.manifest.json'),
    }),
    new DllReferencePlugin({
      // 描述 polyfill 动态链接库的文件内容
      manifest: require('./dist/polyfill.manifest.json'),
    }),
  ],
  devtool: 'source-map'
};

```
#### 执行构建
在修改好以上两个 Webpack 配置文件后，需要重新执行构建。 重新执行构建时要注意的是需要先把动态链接库相关的文件编译出来，
因为主 Webpack 配置文件中定义的 DllReferencePlugin 依赖这些文件。
执行构建时流程如下：
1. 如果动态链接库相关的文件还没有编译出来，就需要先把它们编译出来。
    方法是执行 webpack --config webpack_dll.config.js 命令；
2. 在确保动态链接库存在时，才能正常的编译出入口执行文件。方法是执行
    webpack 命令。这时你会发现构建速度有了非常大的提升。
### 使用HappyPack
由于有大量文件需要处理和解析，构建是文件的读写和计算密集型的操作，特别是当文件数量变多后，webpack构建慢的问题会显的严重，
运行在Node.js 之上的webpack是单线程模型的，也就是说webpack需要处理任务需要一件件挨着做，不能并发执行。

文件的读写和计算机的操作无法避免，且可以让webpack 同一时间处理多个任务，发挥多核cpu电脑威力，

HappyPack 就是让webpack 做到这一点，它把任务分解 给多个子进程去并发执行，子进程处理完毕后再把结果发给主进程。

由于JS 是单线程模型，要发挥多核cpu的能力，只能通过多进程去实现，而无法通过多线程实现

#### HappyPack 接入
分解任务和管理线程的事情HappyPack 会已经处理完毕，只是接入Happy Pack ，代码如下

```js

const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HappyPack = require('happypack');

module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        // 把对 .js 文件的处理转交给 id 为 babel 的 HappyPack 实例
        use: ['happypack/loader?id=babel'],
        // 排除 node_modules 目录下的文件，node_modules 目录下的文件都是采用的 ES5 语法，没必要再通过 Babel 去转换
        exclude: path.resolve(__dirname, 'node_modules'),
      },
      {
        // 把对 .css 文件的处理转交给 id 为 css 的 HappyPack 实例
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          use: ['happypack/loader?id=css'],
        }),
      },
    ]
  },
  plugins: [
    new HappyPack({
      // 用唯一的标识符 id 来代表当前的 HappyPack 是用来处理一类特定的文件
      id: 'babel',
      // 如何处理 .js 文件，用法和 Loader 配置中一样
      loaders: ['babel-loader?cacheDirectory'],
      // ... 其它配置项
    }),
    new HappyPack({
      id: 'css',
      // 如何处理 .css 文件，用法和 Loader 配置中一样
      loaders: ['css-loader'],
    }),
    new ExtractTextPlugin({
      filename: `[name].css`,
    }),
  ],
};

```

以上代码有两点重要的修改：
    ● 在 Loader 配置中，所有文件的处理都交给了 happypack/loader 去处理，使用紧跟其后的 querystring ?id=babel
 去告诉 happypack/loader去选择哪个 HappyPack 实例去处理文件；
    ● 在 Plugin 配置中，新增了两个 HappyPack 实例分别用于告诉 happypack/loader 去如何处理 .js 和 .css 文件。
选项中的 id 属性的值和上面 querystring 中的 ?id=babel 相对应，选项中的 loaders 属性和 Loader 配置中一样；
在实例化 HappyPack 插件的时候，除了可以传入 id 和 loaders 两个参数外，HappyPack 还支持如下参数：
    ● threads 代表开启几个子进程去处理这一类型的文件，默认是3个，类型必须是整数；
    ● verbose 是否允许 HappyPack 输出日志，默认是 true；
    ● threadPool 代表共享进程池，即多个 HappyPack 实例都使用同一个共享进程池中的子进程去处理任务，以防止资源占用过多，
    相关代码如下

```js

const HappyPack = require('happypack');
// 构造出共享进程池，进程池中包含5个子进程
const happyThreadPool = HappyPack.ThreadPool({ size: 5 });

module.exports = {
  plugins: [
    new HappyPack({
      // 用唯一的标识符 id 来代表当前的 HappyPack 是用来处理一类特定的文件
      id: 'babel',
      // 如何处理 .js 文件，用法和 Loader 配置中一样
      loaders: ['babel-loader?cacheDirectory'],
      // 使用共享进程池中的子进程去处理任务
      threadPool: happyThreadPool,
    }),
    new HappyPack({
      id: 'css',
      // 如何处理 .css 文件，用法和 Loader 配置中一样
      loaders: ['css-loader'],
      // 使用共享进程池中的子进程去处理任务
      threadPool: happyThreadPool,
    }),
    new ExtractTextPlugin({
      filename: `[name].css`,
    }),
  ],
};

```
接入HappyPack 后，需要给项目安装新的依赖：
npm i -D happypack

安装成功后重新执行构建 得到以下HappyPack 输出日志：

```js

Happy[babel]: Version: 4.0.0-beta.5. Threads: 3
Happy[babel]: All set; signaling webpack to proceed.
Happy[css]: Version: 4.0.0-beta.5. Threads: 3
Happy[css]: All set; signaling webpack to proceed.
```
说明你的happyPack 配置生效，得知happypack 分别启动3个子进程去并行处理任务。

happyPack 原理

在整个 Webpack 构建流程中，最耗时的流程可能就是 Loader 对文件的转换操作了，因为要转换的文件数据巨多，
而且这些转换操作都只能一个个挨着处理。 HappyPack 的核心原理就是把这部分任务分解到多个进程去并行处理，
从而减少了总的构建时间。
从前面的使用中可以看出所有需要通过 Loader 处理的文件都先交给了 happypack/loader 去处理，收集到了这些文件的处理权后
 HappyPack 就好统一分配了。
每通过 new HappyPack() 实例化一个 HappyPack 其实就是告诉 HappyPack 核心调度器如何通过一系列 Loader 去转换一类文件，
并且可以指定如何给这类转换操作分配子进程。
核心调度器的逻辑代码在主进程中，也就是运行着 Webpack 的进程中，核心调度器会把一个个任务分配给当前空闲的子进程，
子进程处理完毕后把结果发送给核心调度器，它们之间的数据交换是通过进程间通信 API 实现的。
核心调度器收到来自子进程处理完毕的结果后会通知 Webpack 该文件处理完毕。

#### 使用ParallelUglifyPlugin 

代码压缩采用的插件，UglifyJS 且webpack 也是内置了他，由于压缩JS 代码需要先把代码进行解析，成用obj抽象表示的AST语法树，
再去应用各种规则分析和处理AST ，导致计算量巨大，耗时非常多


使用多进程并行处理的思想引入到代码压缩，ParallelUglifyPlugin 完成这个事情，当webpack 有多个JS 文件输出和压缩时，原本会使用UglifyJS 去一个个挨着压缩在输出，  但是 ParallelUglifyPlugin 则会开启多个子进程，把对多个文件的压缩工作分配给多个子进程去完成，每个子进程其实还是通过 UglifyJS 去压缩代码，但是变成了并行执行。 所以 ParallelUglifyPlugin 能更快的完成对多个文件的压缩工作。

使用 ParallelUglifyPlugin ，把原来的webpack 配置文件中内置的 UglifyPlugin 去掉后，再替换成ParallelUglifyPlugin ：

```js

const path = require('path');
const DefinePlugin = require('webpack/lib/DefinePlugin');
const ParallelUglifyPlugin = require('webpack-parallel-uglify-plugin');

module.exports = {
  plugins: [
    // 使用 ParallelUglifyPlugin 并行压缩输出的 JS 代码
    new ParallelUglifyPlugin({
      // 传递给 UglifyJS 的参数
      uglifyJS: {
        output: {
          // 最紧凑的输出
          beautify: false,
          // 删除所有的注释
          comments: false,
        },
        compress: {
          // 在UglifyJs删除没有用到的代码时不输出警告
          warnings: false,
          // 删除所有的 `console` 语句，可以兼容ie浏览器
          drop_console: true,
          // 内嵌定义了但是只用到一次的变量
          collapse_vars: true,
          // 提取出出现多次但是没有定义成变量去引用的静态值
          reduce_vars: true,
        }
      },
    }),
  ],
};
```
在通过 new ParallelUglifyPlugin() 实例化时，支持以下参数：
● test：使用正则去匹配哪些文件需要被 ParallelUglifyPlugin 压缩，默认是 /.js$/，也就是默认压缩所有的 .js 文件；
● include：使用正则去命中需要被 ParallelUglifyPlugin 压缩的文件。默认为 []；
● exclude：使用正则去命中不需要被 ParallelUglifyPlugin 压缩的文件。默认为 []；
● cacheDir：缓存压缩后的结果，下次遇到一样的输入时直接从缓存中获取压缩后的结果并返回。cacheDir 用于配置缓存存放的目录路径。默认不会缓存，想开启缓存请设置一个目录路径；
● workerCount：开启几个子进程去并发的执行压缩。默认是当前运行电脑的 CPU 核数减去1；
● sourceMap：是否输出 Source Map，这会导致压缩过程变慢；
● uglifyJS：用于压缩 ES5 代码时的配置，Object 类型，直接透传给 UglifyJS 的参数；
● uglifyES：用于压缩 ES6 代码时的配置，Object 类型，直接透传给 UglifyES 的参数；


接入 ParallelUglifyPlugin 后 更新依赖

npm i -D webpack-parallel-uglify-plugin 

安装成功后，重新执行构建你会发现速度变快了许多。如果设置 cacheDir 开启了缓存，在之后的构建中会变的更快


### 压缩CSS 

压缩css 代码也可以像JS 那样被压缩，以达到提升加载速度和代码混淆的作用。比较成熟的css 压缩工具是 cssnano，基于PostCSS

cssnano 接入webpack ,因为css-loader 已经将其内置了， 要开启 cssnano 去压缩代码只需要开启css-loader 的minimize 参数，

```js

const path = require('path');
const {WebPlugin} = require('web-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,// 增加对 CSS 文件的支持
        // 提取出 Chunk 中的 CSS 代码到单独的文件中
        use: ExtractTextPlugin.extract({
          // 通过 minimize 选项压缩 CSS 代码
          use: ['css-loader?minimize']
        }),
      },
    ]
  },
  plugins: [
    // 用 WebPlugin 生成对应的 HTML 文件
    new WebPlugin({
      template: './template.html', // HTML 模版文件所在的文件路径
      filename: 'index.html' // 输出的 HTML 的文件名称
    }),
    new ExtractTextPlugin({
      filename: `[name]_[contenthash:8].css`,// 给输出的 CSS 文件名称加上 Hash 值
    }),
  ],
};

```

## CDN 加速
###  CDN 概念

  CDN 又叫内容分发网络，通过资源部署到世界各地，用户在访问时就近原则从离用户最近服务器来获取资源，从而加速资源的获取速度，
  CDN 通过优化物理链路层传输过程中的网速有限，丢包等问题来来提升网速， 其作用 加速网络传输

  在此 可不必理解CDN 的具体运行流程和实现原里，可以简单的把CDN 的服务看作成更快的 http 服务。
  各大云服务提供商 提供了 收费的CDN 服务。

  网站接入CDN ，需要把网页的静态资源上传到CDN的服务上去，在服务这些静态资源的时候通过CDN 服务提供的URL 地址去访问。

```js

dist
|-- app_9d89c964.js
|-- app_a6976b6d.css
|-- arch_ae805d49.png
 -- index.html


 <html>
<head>
  <meta charset="UTF-8">
  <link rel="stylesheet" href="app_a6976b6d.css">
</head>
<body>
<div id="app"></div>
<script src="app_9d89c964.js"></script>
</body>
</html>


body{background:url(arch_ae805d49.png) repeat}h1{color:red}
``` 
可以看出到导入资源时都是通过相对路径去访问的，当把这些资源都放到同一个 CDN 服务上去时，网页是能正常使用的。 
但需要注意的是由于 CDN 服务一般都会给资源开启很长时间的缓存，例如用户从 CDN 上获取到了 index.html 这个文件后， 
即使之后的发布操作把 index.html文件给重新覆盖了，但是用户在很长一段时间内还是运行的之前的版本，这会新的导致发布不能立即生效。
要避免以上问题，业界比较成熟的做法是这样的：

  ● 针对 HTML 文件：不开启缓存，把 HTML 放到自己的服务器上，而不是 CDN 服务上，同时关闭自己服务器上的缓存。
    自己的服务器只提供 HTML 文件和数据接口；
  ● 针对静态的 JavaScript、CSS、图片等文件：开启 CDN 和缓存，上传到 CDN 服务上去，同时给每个文件名带上由
    文件内容算出的 Hash 值， 例如上面的 app_a6976b6d.css 文件。 带上 Hash 值的原因是文件名会随着文件内容而
    变化，只要文件发生变化其对应的 URL 就会变化，它就会被重新下载，无论缓存时间有多长；
 
#### 用webpack 实现CDN的接入

  ● 静态资源的导入 URL 需要变成指向 CDN 服务的绝对路径的 URL 而不是相对于 HTML 文件的 URL；
  ● 静态资源的文件名称需要带上有文件内容算出来的 Hash 值，以防止被缓存；
  ● 不同类型的资源放到不同域名的 CDN 服务上去，以防止资源的并行加载被阻塞；

  ```js

const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const {WebPlugin} = require('web-webpack-plugin');

module.exports = {
  // 省略 entry 配置...
  output: {
    // 给输出的 JavaScript 文件名称加上 Hash 值
    filename: '[name]_[chunkhash:8].js',
    path: path.resolve(__dirname, './dist'),
    // 指定存放 JavaScript 文件的 CDN 目录 URL
    publicPath: '//js.cdn.com/id/',
  },
  module: {
    rules: [
      {
        // 增加对 CSS 文件的支持
        test: /\.css$/,
        // 提取出 Chunk 中的 CSS 代码到单独的文件中
        use: ExtractTextPlugin.extract({
          // 压缩 CSS 代码
          use: ['css-loader?minimize'],
          // 指定存放 CSS 中导入的资源（例如图片）的 CDN 目录 URL
          publicPath: '//img.cdn.com/id/'
        }),
      },
      {
        // 增加对 PNG 文件的支持
        test: /\.png$/,
        // 给输出的 PNG 文件名称加上 Hash 值
        use: ['file-loader?name=[name]_[hash:8].[ext]'],
      },
      // 省略其它 Loader 配置...
    ]
  },
  plugins: [
    // 使用 WebPlugin 自动生成 HTML
    new WebPlugin({
      // HTML 模版文件所在的文件路径
      template: './template.html',
      // 输出的 HTML 的文件名称
      filename: 'index.html',
      // 指定存放 CSS 文件的 CDN 目录 URL
      stylePublicPath: '//css.cdn.com/id/',
    }),
    new ExtractTextPlugin({
      // 给输出的 CSS 文件名称加上 Hash 值
      filename: `[name]_[contenthash:8].css`,
    }),
    // 省略代码压缩插件配置...
  ],
};

```

