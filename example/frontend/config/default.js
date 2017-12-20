module.exports = {
  routes: {
    alias: '/',
    // prefix: '/demo',
    defaultRoute: 'post/index'
  },
  middleware: [
    'err'
  ],
  auth: {
    test: 'test'
  }
}
