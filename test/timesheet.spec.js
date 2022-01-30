import tap from 'tap'
import fs from 'fs'
import path from 'path'
import { simpleProjectRootDir } from '@foo-dog/utils'
import { timesheet, removeRepeats, groupByDates } from '../src/timesheet.js'
import parseArguments from '../src/parse_arguments.js'

const filename = simpleProjectRootDir() + '/test/example.txt'

const debug = process.argv.includes('--debug') ? (...objs) => console.log(...objs) : () => {}

const options = Object.assign(parseArguments(process.argv.slice(2)), { outputColor: false })

tap.test('remove intervals of the same event next to each other', t => {

  const input = fs.readFileSync(path.resolve(filename)).toString()

  const step1 = groupByDates(input)

  const actual = removeRepeats(step1)

  debug('actual=', actual)

  const expected = {
      "2022-01-27": [
        {
          "time": new Date("2022-01-27T14:00:00.000Z"),
          "event": "login",
        },
        {
          "time": new Date("2022-01-27T18:00:00.000Z"),
          "event": "logout",
        },
        {
          "time": new Date("2022-01-27T19:00:00.000Z"),
          "event": "login",
        },
        {
          "time": new Date("2022-01-28T00:00:00.000Z"),
          "event": "logout",
        },
      ]
    }

  debug('expected=', expected)

  t.same(actual, expected)
  
  t.end()
})

tap.test('testing removing intervals from just one entry', t => {

  const input = fs.readFileSync(path.resolve(filename)).toString().split('\n')[0]

  const step1 = groupByDates(input)

  const actual = removeRepeats(step1)

  debug('actual=', actual)

  t.same(actual['2022-01-27'][0].event, 'login')
  
  t.end()
})

tap.test('no intervals printed', t => {

  const input = fs.readFileSync(path.resolve(filename)).toString()

  const actual = timesheet(input, options)

  debug('actual=', actual)

  const expected = "2022-01-27 total is  9 hours,  0 minutes"

  debug('expected=', expected)

  t.same(actual, expected)
  
  t.end()
})

tap.test('running total', t => {

  const input = fs.readFileSync(path.resolve(filename)).toString().split('\n')[0]

  const actual = timesheet(input, options)

  debug('actual=', actual)

  t.match(actual, /.*and counting/)
  
  t.end()
})

tap.test('only minutes', t => {

  const input = fs.readFileSync(path.resolve(simpleProjectRootDir() + '/test/only_minutes.txt')).toString()

  const actual = timesheet(input, options)

  debug('actual=', actual)

  const expected = "2022-01-27 total is           30 minutes"

  debug('expected=', expected)

  t.same(actual, expected)
  
  t.end()
})

tap.test('intervals printed', t => {

  const input = fs.readFileSync(path.resolve(filename)).toString()

  const actual = timesheet(input, options)

  debug('actual=', actual)

  const expected = "2022-01-27 total is  9 hours,  0 minutes"

  debug('expected=', expected)

  t.same(actual, expected)
  
  t.end()
})

tap.test(undefined, t => {

  const input = fs.readFileSync(path.resolve(filename)).toString()

  const actual = timesheet(input, options)

  debug('actual=', actual)

  const expected = "2022-01-27 total is  9 hours,  0 minutes"

  debug('expected=', expected)

  t.same(actual, expected)
  
  t.end()
})