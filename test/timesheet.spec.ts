#! /usr/local/bin/node

// Copyright (c) 2022, 2023 Adam Koch. All rights reserved.

// This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

// This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

// You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.

import tap from 'tap'
import fs from 'fs'
import path from 'path'
import { inspect } from 'util'
import { simpleProjectRootDir } from '@foo-dog/utils'
import { timesheet, removeRepeats, groupByDates, Interval, Event, convertToEvents, Summary, createIntervals } from '../src/timesheet.js'
import Reporter from '../src/reporter.js'
import parseArguments from '../src/parse_arguments.js'
import { Options, createDateString } from '../src/common.ts'
import debugFunc from 'debug'
const debug = debugFunc('timesheet/test')

const filename = simpleProjectRootDir() + '/test/example.txt'

// const debug = process.argv.includes("--debug")
//   ? (...objs) => console.log(...objs)
//   : () => {};

const options = Object.assign(parseArguments(process.argv.slice(2)), {
  outputColor: false,
})

tap.test('remove intervals of the same event next to each other', t => {
  const input = fs.readFileSync(path.resolve(filename)).toString()

  const events = input
    .split('\n')
    .filter(line => line.trim().length)
    .filter(line => line.startsWith('2')) // might remove this at some point
    .map(line => {
      return Event.parse(line)
    })

  const step1 = groupByDates(events)
  debug('step1=', step1)

  const actual = removeRepeats(step1)

  debug('actual=', actual)

  const expected = {
    '2022-01-27': [
      {
        instant: new Date('2022-01-27T14:00:00.000Z'),
        name: 'login',
      },
      {
        instant: new Date('2022-01-27T18:00:00.000Z'),
        name: 'logoff',
      },
      {
        instant: new Date('2022-01-27T19:00:00.000Z'),
        name: 'login',
      },
      {
        instant: new Date('2022-01-28T00:00:00.000Z'),
        name: 'logoff',
      },
    ],
  }

  debug('expected=', expected)

  t.same(actual, expected)

  t.end()
})

tap.test('testing removing intervals from just one entry', t => {
  const input = fs.readFileSync(path.resolve(filename)).toString().split('\n')[0]

  const events = convertToEvents(input)

  const step1 = groupByDates(events)

  const actual = removeRepeats(step1)

  debug('actual=', actual)

  t.same(actual['2022-01-27'][0].name, 'login')

  t.end()
})

tap.test('no intervals printed', t => {
  const input = fs.readFileSync(path.resolve(filename)).toString()
  debug('input=', input)


  const actual = timesheet(input, options)

  debug('actual=', actual)

  const expected = '2022-01-27 total is  9 hours,  0 minutes'

  debug('expected=', expected)

  t.same(new Reporter(actual, options).toString(), expected)

  t.end()
})

tap.test('running total', t => {
  const actual = timesheet(createDateString(0, 0, new Date()) + ' login', options)

  debug('actual=', actual)

  t.match(new Reporter(actual, options).toString(), /.*and counting/)

  t.end()
})

tap.test('only minutes', t => {
  const input = fs.readFileSync(path.resolve(simpleProjectRootDir() + '/test/only_minutes.txt')).toString()

  const options = {}

  const actual = timesheet(input, options)

  debug('actual=', actual)

  const expected = '2022-01-27 total is            1 minute '

  debug('expected=', expected)

  t.same(new Reporter(actual, options).toString(), expected)

  t.end()
})

tap.test('intervals printed', t => {
  const input = fs.readFileSync(path.resolve(filename)).toString()

  const options: Options = {}

  const actual = timesheet(input, options)

  debug('actual=', actual)

  const expected = ' - 08:00 to 12:00    4 hours,  0 minutes\n - 13:00 to 18:00    5 hours,  0 minutes\n2022-01-27 total is  9 hours,  0 minutes'

  debug('expected=', expected)

  options.outputIntervals = true

  t.same(new Reporter(actual, options).toString(), expected)

  t.end()
})

tap.test('bug 1', t => {
  const input = fs.readFileSync(path.resolve(simpleProjectRootDir() + '/test/bug1.txt')).toString()

  const options: Options = {}

  const actual = timesheet(input, options)

  debug('actual=', actual)

  const expected = [
    new Summary(
      '2022-04-28',
      [
        'First event of the day was a logoff at 08:35',
        new Interval(new Date('2022-04-28T13:40:00.000Z'), new Date('2022-04-28T15:10:00.000Z')),
        new Interval(new Date('2022-04-28T15:50:00.000Z'), new Date('2022-04-28T16:04:00.000Z')),
      ],
      104
    ),
  ]

  const expectedAsString =
    ' - First event of the day was a logoff at 08:35\n - 08:40 to 10:10    1 hour,  30 minutes\n - 10:50 to 11:04             14 minutes\n2022-04-28 total is  1 hour,  44 minutes'

  debug('expected=', expected)

  t.same(actual, expected)

  options.outputIntervals = true

  t.same(new Reporter(actual, options).toString(), expectedAsString)

  t.end()
})


tap.test('intervals printed', t => {
  const input = fs.readFileSync(path.resolve(filename)).toString()

  const options = { outputIntervals: true }

  const actual = timesheet(input, options)

  debug('actual=', actual)

  const expected = ` - 08:00 to 12:00    4 hours,  0 minutes
 - 13:00 to 18:00    5 hours,  0 minutes
2022-01-27 total is  9 hours,  0 minutes`

  debug('expected=', expected)

  t.same(new Reporter(actual, options).toString(), expected)

  t.end()
})


tap.test('bug 2', t => {
  const input = fs.readFileSync(path.resolve(simpleProjectRootDir() + '/test/bug2.txt')).toString()

  const options = { }

  const actual = timesheet(input, options)

  debug('actual=', inspect(actual, false, 10))

  const expected = [
    new Summary(
      '2023-03-01',
      [
        new Interval(new Date('2023-03-01T09:12-06:00'), new Date('2023-03-01T16:17-06:00')),
        new Interval(new Date('2023-03-01T16:27-06:00'), new Date('2023-03-01T16:49-06:00')),
        'Last event of the day was a login at 17:04'
      ],
      447
    ),
    new Summary(
      '2023-03-02',
      [
        new Interval(new Date('2023-03-02T08:04-06:00'), new Date('2023-03-02T11:57-06:00')),
        new Interval(new Date('2023-03-02T13:04-06:00'), new Date('2023-03-02T17:09-06:00')),
        new Interval(new Date('2023-03-02T19:52-06:00'), new Date('2023-03-02T22:52-06:00')),
      ],
      658
    ),
  ]
  debug('expected=', inspect(expected, false, 10))

  t.same(actual, expected)

  t.end()
})


tap.test('weekly summary printed', t => {
  const input = fs.readFileSync(path.resolve('test/weekly.txt')).toString()

  const options = { outputIntervals: false, outputWeekly: true }

  const actual = timesheet(input, options)

  debug('actual=', inspect(actual, false, 10))

  const expected = `2023-W06 total is 43 hours, 58 minutes
2023-W07 total is 41 hours, 58 minutes
2023-W08 total is 41 hours,  8 minutes
2023-W09 total is 45 hours, 43 minutes
2023-W10 total is 27 hours, 39 minutes`

  debug('expected=', expected)

  t.same(new Reporter(actual, options).toString(), expected)

  t.end()
})



tap.test('weekly with intervals', t => {
  const input = fs.readFileSync(path.resolve('test/weekly.txt')).toString()

  const options = { outputIntervals: true, outputWeekly: true }

  const actual = timesheet(input, options)

  debug('actual=', inspect(actual, false, 10))

  const expected = ` - 2023-02-06 is    8 hours,  6 minutes
 - 2023-02-07 is   10 hours,  8 minutes
 - 2023-02-08 is    8 hours,  5 minutes
 - 2023-02-09 is    8 hours, 28 minutes
 - 2023-02-10 is    9 hours, 11 minutes
2023-W06 total is 43 hours, 58 minutes
 - 2023-02-13 is    9 hours, 55 minutes
 - 2023-02-14 is    8 hours, 10 minutes
 - 2023-02-15 is    8 hours, 34 minutes
 - 2023-02-16 is    7 hours, 26 minutes
 - 2023-02-17 is    7 hours, 53 minutes
2023-W07 total is 41 hours, 58 minutes
 - 2023-02-20 is    7 hours, 39 minutes
 - 2023-02-21 is    8 hours, 48 minutes
 - 2023-02-22 is    7 hours,  8 minutes
 - 2023-02-23 is    9 hours, 18 minutes
 - 2023-02-24 is    8 hours, 15 minutes
2023-W08 total is 41 hours,  8 minutes
 - 2023-02-27 is   10 hours, 13 minutes
 - 2023-02-28 is    8 hours, 45 minutes
 - 2023-03-01 is    7 hours, 27 minutes
 - 2023-03-02 is   10 hours, 58 minutes
 - 2023-03-03 is    8 hours, 20 minutes
2023-W09 total is 45 hours, 43 minutes
 - 2023-03-06 is   10 hours, 23 minutes
 - 2023-03-07 is    8 hours, 27 minutes
 - 2023-03-08 is    8 hours, 49 minutes
2023-W10 total is 27 hours, 39 minutes`

  debug('expected=', expected)

  t.same(new Reporter(actual, options).toString(), expected)

  t.end()
})