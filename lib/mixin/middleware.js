const compose = require('koa-compose')
const assert = require('assert')

const toString = Object.prototype.toString

module.exports = {
  loadMiddlewares (middlewares = [], moduleName) {
    const config = this.app.configs[moduleName]
    const allMiddlewares = this.app.middlewares
    const all = []

    for (let middleware of middlewares) {
      let handler
      let name
      if (typeof middleware === 'string') {
        name = middleware
        // 从本模块，往上查询
        handler = allMiddlewares[moduleName][middleware] || allMiddlewares[this.root][middleware] || this.app.buildInMiddlewares[middleware]

        if (!handler) {
          this.app.logger.app.error(`cannot find middleware ${middleware}`)
          continue
        }
      } else if (typeof middleware === 'object') {
        name = middleware.name
        handler = middleware.package

        if (typeof handler !== 'function') {
          this.app.logger.app.error(`cannot find middleware ${middleware}`)
          continue
        }
      } else {
        assert(false, `The middleware in module [${module}]  must be string or object`)
      }

      const options = config[name]

      if (!options || options.enable !== false) {
        // enable为false不执行中间件
        const fn = handler(config[name], this.app)

        // 中间件才会加入到执行队列中
        if (toString.call(fn) === '[object AsyncFunction]') {
          all.push(fn)
        }
      }
    }

    if (all.length === 0) {
      return
    }

    return compose(all)
  }
}
