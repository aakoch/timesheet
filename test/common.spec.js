#! /usr/local/bin/node

// Copyright (c) 2022, Adam Koch. All rights reserved.

// This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

// This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

// You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.

import tap from 'tap'
import { createDateString, appendTimestamp, getOptions } from '../src/common.js?test'

tap.test('createDateString with no offset', t => {

  const expected = '2022-01-22T22:22-06:00' // works only in CST
  // const expected = '2022-01-22T22:22+00:00' // works only in UTC - see package.json on how to tell NodeJS to use UTC
  const date = new Date(2022, 0, 22, 22, 22, 0)
  t.same(createDateString(date), expected)
  
  t.end()
})

tap.test('createDateString with offset', t => {

  const expected = '2022-01-22T22:13-06:00' // works only in CST
  // const expected = '2022-01-22T22:13+00:00' // works only in UTC - see package.json on how to tell NodeJS to use UTC
  const date = new Date(2022, 0, 22, 22, 22, 0)
  t.same(createDateString(0, 9, date), expected)
  
  t.end()
})

tap.test('getOptions', t => {

  const input = ['10h', '5m']

  const expected = { offset_hours: 10, offset_minutes: 5 }

  const actual = getOptions(input)
  console.log('actual=', actual)
  t.same(actual, expected)
  
  t.end()
})
