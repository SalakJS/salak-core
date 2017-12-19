const assert = require('assert')
const SalakCore = require('..')

describe('SalakCore', () => {
  it('should expose properties', () => {
    assert(SalakCore)
    assert(SalakCore.defaults)
    assert(SalakCore.Controller)
    assert(SalakCore.Service)
    assert(SalakCore.BaseContext)
    assert(SalakCore.Joi)
  })
})
