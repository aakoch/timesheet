// Copyright (c) 2022, Adam Koch. All rights reserved.

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
