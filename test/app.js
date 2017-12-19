const request = require('supertest')
const assert = require('assert')
const path = require('path')
const app = require('./fixtures/app')

describe('Test app', () => {
  describe('create salak-core', () => {
    it('app baseDir', () => {
      assert.equal(app.baseDir, path.resolve(__dirname, 'fixtures/app'))
    })
  })

  describe('test app request', () => {
    it('request /frontend/post', (done) => {
      request(app.callback())
        .get('/frontend/post')
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err)
          }

          assert.equal('hello, post.', res.text)
          done()
        })
    })

    it('request /unknow, should trigger error middleware', (done) => {
      request(app.callback())
        .get('/unknow')
        .expect(404)
        .end((err, res) => {
          if (err) {
            return done(err)
          }

          assert.equal('error.', res.text)
          done()
        })
    })
  })
})
