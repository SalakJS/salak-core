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
      level: 'auto'
    },
    categories: {
      default: {
        type: 'dateFile',
        filename: 'default/default.log',
        datePattern: 'YYYY-MM-DD'
      },
      http: {
        type: 'dateFile',
        filename: 'access/access.log',
        datePattern: 'YYYY-MM-DD'
      },
      error: {
        type: 'levelFilter',
        filename: 'errors/errors.log',
        datePattern: 'YYYY-MM-DD',
        level: 'error'
      }
    },
    defaultLevel: 'info'
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
