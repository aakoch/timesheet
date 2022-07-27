#! /usr/local/bin/node

// Copyright (c) 2022, Adam Koch. All rights reserved.

// This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

// This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

// You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.

import tap from 'tap'
import parseArguments from '../src/parse_arguments.js'

tap.test('node', t => {
  const input = []
  const expected = { debug: false, outputIntervals: false, outputColor: true }

  t.same(parseArguments(input), expected)

  t.end()
})

tap.test('debug and printIntervals', t => {
  const input = ['--debug', '--printIntervals', '--badArgument']
  const expected = { debug: true, outputIntervals: true, outputColor: true }

  t.same(parseArguments(input), expected)

  t.end()
})
