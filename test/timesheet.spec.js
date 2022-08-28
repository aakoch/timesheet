#! /usr/local/bin/node

// Copyright (c) 2022, Adam Koch. All rights reserved.

// This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

// This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

// You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.

import tap from 'tap'
import fs from 'fs'
import path from 'path'
import { simpleProjectRootDir } from '@foo-dog/utils'
import { timesheet, removeRepeats, groupByDates, Interval, Event, convertToEvents, Summary } from '../src/timesheet.js'
import Reporter from '../src/reporter.js'
import parseArguments from '../src/parse_arguments.js'
import { createDateString } from '../src/common.js'
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

  const actual = timesheet(input, options)

  debug('actual=', actual)

  const expected = '2022-01-27 total is  9 hours,  0 minutes'

  debug('expected=', expected)

  t.same(new Reporter(actual, options).toString(), expected)

  t.end()
})

tap.test('running total', t => {
  const actual = timesheet(createDateString(new Date()) + ' login', options)

  debug('actual=', actual)

  t.match(new Reporter(actual, options).toString(), /.*and counting/)

  t.end()
})

tap.test('only minutes', t => {
  const input = fs.readFileSync(path.resolve(simpleProjectRootDir() + '/test/only_minutes.txt')).toString()

  const actual = timesheet(input, options)

  debug('actual=', actual)

  const expected = '2022-01-27 total is            1 minute '

  debug('expected=', expected)

  t.same(new Reporter(actual, options).toString(), expected)

  t.end()
})

tap.test('intervals printed', t => {
  const input = fs.readFileSync(path.resolve(filename)).toString()

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
