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