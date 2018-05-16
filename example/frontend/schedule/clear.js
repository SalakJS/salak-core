const Schedule = require('../../..').Schedule

class Clear extends Schedule {
  static timer () {
    return {
      interval: 1000
    }
  }

  run () {
    this.logger.info('trigger clear')
  }
}

module.exports = Clear
