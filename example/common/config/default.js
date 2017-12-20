module.exports = {
  bootstraps: [
    // 两种写法
    'frontend'
    // key => path
    /*
    {
      backend: path.join(__dirname, '..', '..', 'backend')
    }
    */
  ],
  routes: {
    // prefix: '/api',
    defaultRoute: 'frontend/post'
  },
  logger: {
    injectConsole: true,
    capture: {
      enable: true,
      category: 'http',
      level: 'info'
    },
    categories: {
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
    defaultLevel: 'info',
    pm2: true
  },
  middleware: [
    // 两种写法
    'mongo',
    {
      name: 'error',
      package: require('../middleware/error')
    }
  ]
}
