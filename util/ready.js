const EventEmitter = require('events')

const READY_CALLBACK = Symbol('salak#ReadyCallback')
let instance = null

class Ready extends EventEmitter {
  constructor ({ timeout = 120000 } = {}) {
    super()
    this[READY_CALLBACK] = []
    this.timer = setTimeout(() => {
      this.emit('timeout')
    }, timeout)
  }

  ready (fn) {
    if (typeof fn === 'function') {
      this[READY_CALLBACK].push(fn)
      return
    }

    const done = !!fn

    if (done) {
      this._call()
    }
  }

  async _call () {
    for (let fn of this[READY_CALLBACK]) {
      await fn()
    }

    if (this.timer) {
      clearTimeout(this.timer)
    }

    this.emit('ready')
    this[READY_CALLBACK] = []
  }

  static getInstance (options) {
    if (instance) {
      return instance
    }

    instance = new Ready(options)
    return instance
  }
}

module.exports = Ready
