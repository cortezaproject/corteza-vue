import { expect } from 'chai'
import { getDate, setDate, getTime, setTime } from './index'

describe(__filename, () => {
  describe('Can get and set time', () => {
    it('getDate', () => {
      expect(getDate('2021-06-29 13:57')).to.equal('2021-06-29')
    })

    it('setDate', () => {
      expect(setDate('2021-06-30', '2021-06-29 13:57')).to.equal('2021-06-30 13:57')
    })

    it('getTime', () => {
      expect(getTime('2021-06-29 13:57')).to.equal('13:57')
    })

    it('setTime', () => {
      expect(setTime('14:00', '2021-06-29 13:57')).to.equal('2021-06-29 14:00')
    })
  })
})
