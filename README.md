# salak-core

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![David deps][david-image]][david-url]
[![NPM download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/salak-core.svg?style=flat-square
[npm-url]: https://npmjs.org/package/salak-core
[travis-image]: https://img.shields.io/travis/SalakJS/salak-core.svg?style=flat-square
[travis-url]: https://travis-ci.org/SalakJS/salak-core
[david-image]: https://img.shields.io/david/SalakJS/salak-core.svg?style=flat-square
[david-url]: https://david-dm.org/SalakJS/salak-core
[download-image]: https://img.shields.io/npm/dm/salak-core.svg?style=flat-square
[download-url]: https://npmjs.org/package/salak-core

salak核心库，基于koa 2.0

**不建议直接使用salak-core，可以直接使用 [salak](https://github.com/salakJS/salak)**

## 特性

- 自动路由，根据controller生成service
- 中间件扩展，可以自定义中间件执行顺序
- Joi校验，增强代码健壮性，提供路由执行前参数校验以及输出校验
- 日志插件，基于log4js

## 用法

目录结构

```
├── common
│   ├── config
│   │   └── default.js
│   └── middleware
│       └── error.js
├── blog
│   ├── config
│   │   └── default.js
│   ├── controller
│   │   ├── comment.js
│   │   └── post.js
│   ├── middleware
│   │   ├── auth.js
│   │   └── err.js
│   └── service
│       └── post.js
└── index.js
```

### 安装

```
npm install --save salak-core
```

### 编写controller

```
const { Controller } = require('salak-core')

class Post extends Controller {
  actionIndex () {
    this.ctx.body = 'hello, Post.'
  }
}
```

默认会注册/post 路由

## API

### SalakCore

#### constructor (options)

- {Object} options - 配置
- {String} options.baseDir - 项目根目录
- {Object} options.opts - 其他设置
- {String} options.opts.root - common目录命名，默认为common

#### router

salak-router 实例

#### loader

SalakCoreLoader 实例

## License

MIT
