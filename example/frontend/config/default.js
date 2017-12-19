module.exports = {
  routes: {
    alias: 'blog',
    defaultRoute: 'post/index'
  },
  middleware: [
    'err'
  ],
  auth: {
    test: 'test'
  }
}
