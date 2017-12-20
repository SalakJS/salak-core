'use strict'

/**
 * 日志插件注入，可用app.logger访问到
 *
 * 创 建 者：wengeek <wenwei897684475@gmail.com>
 * 创建时间：2017-12-20
 *
 * 描    述：默认会注册default, app logger
 */

const log4js = require('koa-log4')
const path = require('path')
const fse = require('fs-extra')

module.exports = {
  loaderLogger (options = {}) {
    const {
      root = path.join(this.baseDir, 'logs'),
      injectConsole = this.env !== 'production',
      capture = {
        enable: true,
        category: 'http',
        level: 'info'
      },
      categories = {
        default: {
          type: 'dateFile',
          filename: 'default/default.log',
          pattern: '-yyyy-MM-dd.log'
        },
        http: {
          type: 'dateFile',
          filename: 'access/access.log',
          pattern: '-yyyy-MM-dd.log'
        },
        errors: {
          type: 'logLevelFilter',
          appender: {
            type: 'dateFile',
            filename: 'errors/errors.log',
            pattern: '-yyyy-MM-dd.log'
          },
          level: 'error'
        }
      },
      defaultLevel = this.env === 'production' ? 'error' : 'info',
      pm2 = false
    } = options

    fse.ensureDirSync(root)

    const forAppenders = {}
    const forCategories = {}
    if (injectConsole) {
      forAppenders['console'] = {
        type: 'console'
      }
    }

    const levelLogs = []
    const prefix = 'salakLog'
    for (let category in categories) {
      const item = categories[category]

      if (item.type === 'logLevelFilter') {
        const appender = item.appender

        if (appender.filename) {
          appender.filename = path.join(root, appender.filename)
        }

        forAppenders[prefix + category] = appender
        item.appender = prefix + category

        forAppenders[category] = item
        levelLogs.push(category)
      }
    }

    for (let category in categories) {
      const item = categories[category]

      if (item.type === 'logLevelFilter') {
        continue
      }

      if (item.filename) {
        item.filename = path.join(root, item.filename)
      }

      if (category !== 'console') { // 移除掉console作为category
        forCategories[category] = {
          appenders: (injectConsole ? [category, 'console'] : [category]).concat(levelLogs),
          level: item.level || defaultLevel
        }
      }

      if (item.level) {
        delete item.level
      }

      forAppenders[category] = item
    }

    if (!forCategories['default']) {
      const filename = path.join(root, 'default/default.log')

      forAppenders['default'] = {
        type: 'dateFile',
        filename,
        pattern: '-yyyy-MM.log'
      }

      forCategories['default'] = {
        appenders: (injectConsole ? ['console', 'default'] : ['default']).concat(levelLogs),
        level: defaultLevel
      }
    }

    if (!forCategories['app']) { // 内置的app logger，可以通过app重写
      const filename = path.join(root, 'app/app.log')

      forAppenders['app'] = {
        type: 'dateFile',
        filename,
        pattern: '-yyyy-MM.log'
      }

      forCategories['app'] = {
        appenders: (injectConsole ? ['app', 'console'] : ['app']).concat(levelLogs),
        level: defaultLevel
      }
    }

    const target = {}
    for (let category in forCategories) {
      target[category] = log4js.getLogger(category)
    }

    const logLevels = ['trace', 'debug', 'info', 'warn', 'error', 'fatal']
    // 注入到logger
    logLevels.forEach((method) => {
      const logger = log4js.getLogger()
      target[method] = logger[method].bind(logger)
    })

    const log4Obj = new Proxy(target, {
      get: function (target, key, receiver) {
        if (!target[key]) {
          target[key] = log4js.getLogger(key)
        }

        return Reflect.get(target, key, receiver)
      }
    })

    log4js.configure({
      appenders: forAppenders,
      categories: forCategories,
      pm2
    })

    if (capture.enable !== false) { // 捕获http请求
      this.app.use(log4js.koaLogger(log4js.getLogger(capture.category || 'http'), {
        level: capture.level || defaultLevel
      }))
    }

    return log4Obj
  }
}
