const Controller = require('../../../../../index').Controller

class Post extends Controller {
  constructor (...args) {
    super(...args)
    this.middleware('auth')
  }
  actionIndex () {
    this.ctx.body = 'hello, post.'
  }
}

module.exports = Post
