const schedule = require('salak-schedule')

module.exports = {
  loadSchedules () {
    schedule(this.app.rootConfig.schedule, this.app)
  }
}
