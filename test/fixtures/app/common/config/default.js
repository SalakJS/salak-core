module.exports = {
  bootstraps: [
    'frontend'
  ],
  logger: {
    injectConsole: false,
    capture: {
      enable: false,
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
    defaultLevel: 'error'
  },
  middleware: [
    'error'
  ]
}
