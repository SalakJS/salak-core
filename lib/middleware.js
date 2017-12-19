'use strict'

/**
 * 控制器中中间件处理逻辑
 *
 * 创 建 者：wengeek <wenwei897684475@gmail.com>
 * 创建时间：2017-12-19
 */

class Middleware {
  constructor (name, module, options) {
    this.ignores = []
    this.onlies = []
    this.name = name
    this.module = module
    this.options = options
  }

  only (routes = '') {
    routes.split(' ').forEach((item = '') => {
      item = item.trim()
      if (item !== '' && this.onlies.indexOf(item) === -1) {
        this.onlies.push(item)
      }
    })

    return this
  }

  except (routes) {
    routes.split(' ').forEach((item = '') => {
      item = item.trim()
      if (item !== '' && this.ignores.indexOf(item) === -1) {
        this.ignores.push(item)
      }
    })

    return this
  }

  execute (action = '') {
    if (this.ignores.indexOf(action) !== -1 || (this.onlies.length > 0 && this.onlies.indexOf(action) === -1)) {
      return
    }

    return async (ctx, next) => {
      // 查找对应的middleware
      const middlewares = ctx.app.middlewares

      const middleware = middlewares[this.module] && middlewares[this.module][this.name]
      if (!middleware) {
        ctx.app.logger.app.warn(`cannot load middleware [${this.name}] in module [${this.module}]`)

        await next()
        return
      }

      const defaultConfig = ctx.app.configs[this.module][this.name]

      await middleware(this.options || defaultConfig, this.app)(ctx, next)
    }
  }
}

module.exports = Middleware
