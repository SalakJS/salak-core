'use strict'

/**
 * 基础上下文，基类
 *
 * 创 建 者：wengeek <wenwei897684475@gmail.com>
 * 创建时间：2017-12-19
 */

class Context {
  /**
   * @constructor
   * @param {Object} context ref => koa context
   * @param {Function} next 指针
   * @param {String} module 模块名称
   */
  constructor (context, next, module) {
    this.ctx = context
    this.next = next
    this.app = context.app
    this.logger = this.app.logger
    this.module = module
  }

  params (key) {
    return this.ctx.params[key]
  }

  query (key) {
    return this.ctx.request.query[key]
  }

  body (key) {
    return this.ctx.request.body[key]
  }

  config (key, module) {
    // module无传参往上追溯
    if (!module) {
      const rootConfig = this.app.rootConfig
      const moduleConfig = this.app.moduleConfigs[this.module]

      return moduleConfig[key] || rootConfig[key]
    }

    return this.app.configs[module][key]
  }

  model (name, module) {
    if (!module) {
      module = this.module
    }

    const models = this.app.models[module]
    if (models[name]) {
      this.logger.app.error(`cannot find model ${name}`)
    }

    return models[name]
  }

  service (name, module) {
    if (!module) {
      module = this.module
    }

    const services = this.app.services[module]
    if (!services || !services[name]) {
      this.logger.app.error(`cannot find service ${name}`)
      return
    }

    const Service = services[name]

    return new Service(this.ctx, this.next, this.module)
  }
}

module.exports = Context
