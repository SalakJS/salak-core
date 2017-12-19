const Controller = require('../../../../lib/controller')

class Post extends Controller {
  static behaviors () {
    return {
      routes: {
        'POST /create': 'create'
      },
      rules: {
        index: {
          meta: {
            summary: '创建文章',
            description: '创建',
            tags: ['Blog']
          },
          validate: {
          }
        }
      }
    }
  }

  actionIndex (id) {
    console.log(id)
    this.ctx.body = 'hello, pv' + id + ' ' + Math.random()
  }

  actionCreate () {

  }
}

module.exports = Post
