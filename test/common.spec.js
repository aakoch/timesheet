import tap from 'tap'
import { createDateString, appendTimestamp, getOptions } from '../src/common.js'

tap.test('createDateString with no offset', t => {

  const expected = '2022-01-22T22:22-' + (new Date().getTimezoneOffset() / 60).toString().padStart(2, '0') + ':00'
  const date = new Date(2022, 0, 22, 22, 22, 0)
  t.same(createDateString(0, date), expected)
  
  t.end()
})

tap.test('createDateString with offset', t => {

  const expected = '2022-01-22T22:13-' + (new Date().getTimezoneOffset() / 60).toString().padStart(2, '0') + ':00'
  const date = new Date(2022, 0, 22, 22, 22, 0)
  t.same(createDateString(9, date), expected)
  
  t.end()
})

tap.test('getOptions', t => {

  const input = ['10']

  const expected = { offset: 10 }

  t.same(getOptions(input), expected)
  
  t.end()
})
