'use strict'

/**
 * 日志插件，基于winston
 *
 * 创 建 者：wengeek <wenwei897684475@gmail.com>
 * 创建时间：2018-02-01
 *
 * 描    述：默认注册default, app logger
 */

const path = require('path')
const fse = require('fs-extra')
const { createLogger, format, transports } = require('salak-winston')
const { combine, timestamp, label } = format
const salakLogger = require('../logger')

module.exports = {
  loaderLogger (options = {}) {
    const {
      root = path.join(this.baseDir, 'logs'),
      injectConsole = this.env === 'development', // 开发中打开console
      capture = {
        enable: true,
        category: 'http',
        level: 'auto'
      },
      autoCategory = true, // 自动创建category
      defaultLevel = this.env === 'production' ? 'info' : 'debug'
    } = options
    let categories = options.categories || {}

    fse.ensureDirSync(root)

    categories = Object.assign({}, {
      default: {
        type: 'dateFile',
        filename: 'default/default.log',
        datePattern: 'YYYY-MM-DD'
      },
      app: {
        type: 'dateFile',
        filename: 'app/app.log',
        datePattern: 'YYYY-MM'
      },
      http: {
        type: 'dateFile',
        filename: 'access/access.log',
        datePattern: 'YYYY-MM-DD'
      },
      error: {
        type: 'levelFilter',
        filename: 'error/error.log',
        datePattern: 'YYYY-MM-DD'
      }
    }, categories)

    const target = {}

    // 解析levelFilters
    const commonTransports = []
    for (let category in categories) {
      const item = categories[category]
      if (item.type !== 'levelFilter') {
        continue
      }

      if (item.transport) {
        commonTransports.push(item.transport)
        continue
      }

      // 创建目录
      if (item.filename) {
        const filepath = path.join(root, item.filename)

        const file = path.basename(filepath)
        const filedir = path.dirname(filepath)

        fse.ensureDirSync(filedir)

        commonTransports.push(
          new transports.DailyFile({
            level: item.level || category,
            filename: file,
            dirname: filedir,
            datePattern: item.datePattern,
            handleExceptions: category === 'error' // error注入category
          })
        )
      }
    }

    if (injectConsole) {
      commonTransports.push(
        new transports.SalakConsole({
          handleExceptions: true
        })
      )
    }

    const logLevels = ['debug', 'info', 'warn', 'error']
    for (let category in categories) {
      const item = categories[category]
      if (item.type === 'levelFilter') {
        continue
      }

      if (logLevels.indexOf(category) !== -1) { // 非法定义
        console.warn('cannot defined logger: ' + category)
        continue
      }

      let transport
      if (item.transport) {
        transport = item.transport
      } else if (item.type === 'dateFile') { // category
        const filepath = path.join(root, item.filename)

        const file = path.basename(filepath)
        const filedir = path.dirname(filepath)

        fse.ensureDirSync(filedir)

        transport = new transports.DailyFile({
          level: item.level,
          filename: file,
          dirname: filedir,
          datePattern: item.datePattern
        })
      }

      if (transport) {
        target[category] = createSalakLogger({
          level: defaultLevel,
          name: category,
          transports: [transport].concat(commonTransports)
        })
      }
    }

    logLevels.forEach((method) => {
      const logger = target['default']
      target[method] = logger[method].bind(logger)
    })

    const logObj = new Proxy(target, {
      get (target, key, receiver) {
        if (!target[key]) {
          if (autoCategory) {
            const filedir = path.join(root, key)
            fse.ensureDirSync(filedir)
            target[key] = createSalakLogger({
              name: key,
              level: defaultLevel,
              transports: [
                new transports.DailyFile({
                  filename: `${key}.log`,
                  dirname: filedir
                })
              ].concat(commonTransports)
            })
          } else {
            target[key] = target['default']
          }
        }

        return Reflect.get(target, key, receiver)
      }
    })

    if (capture.enable !== false) { // 捕获http请求
      this.app.use(salakLogger({
        category: capture.category,
        level: capture.level
      }, this.app))
    }

    return logObj
  }
}

function createSalakLogger (options = {}) {
  const {
    level,
    name = 'unknown',
    transports = []
  } = options

  return createLogger({
    level,
    exitOnError: false,
    format: combine(
      label({ label: name }),
      timestamp()
    ),
    transports
  })
}
