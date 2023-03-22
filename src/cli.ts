#! /usr/local/bin/node

// Copyright (c) 2022, Adam Koch. All rights reserved.

// This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

// This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

// You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.

import parseArguments from './parse_arguments'
import { timesheet } from './timesheet'
import fs from 'fs'
import path from 'path'
import os from 'os'
import Reporter from './reporter'

const options = parseArguments(process.argv.slice(2))
const debug = process.argv.includes('--debug') ? (...objs: any) => console.log(...objs) : () => {}
debug('options=', options)

// TODO: make filename customizable
const input = fs.readFileSync(path.resolve(os.homedir() + '/timesheet.txt')).toString()
// debug('input=', input)
console.log(new Reporter(timesheet(input, options), options).toString())
