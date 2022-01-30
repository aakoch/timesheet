#! /usr/local/bin/node

import parseArguments from './parse_arguments.js'
import { timesheet } from './timesheet.js'
import fs from 'fs'
import path from 'path'
import os from 'os'

const options = parseArguments(process.argv.slice(2))
const debug = process.argv.includes('--debug') ? (...objs) => console.log(...objs) : () => {}
debug('options=', options)
const input = fs.readFileSync(path.resolve(os.homedir() + '/timesheet.txt')).toString()
debug('input=', input)
console.log(timesheet(input, options))
  