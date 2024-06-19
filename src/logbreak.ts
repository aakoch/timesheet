#! /usr/local/bin/node

// Copyright (c) 2022, 2023 Adam Koch. All rights reserved.

// This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

// This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

// You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.

import fs from 'fs'
import os from 'os'
import { resolve } from 'path'
import readLastLines from 'read-last-lines'
import { appendTimestamp, getOptions } from './common'
import parseArguments from './parse_arguments'
import Reporter from './reporter'
import { timesheet } from './timesheet'
import {exit} from "process";
import chalk from "chalk";

const options = getOptions(process.argv.slice(2));
if (options.offset_hours === undefined && options.offset_minutes === undefined || (options.offset_hours === 0 && options.offset_minutes === 0)) {
  console.error(chalk.red('Error recording break: A time is required'))
  exit(1)
}
appendTimestamp('logoff', options)
appendTimestamp('login', Object.assign(options, { offset_hours: 0, offset_minutes: 0 } ))


// TODO: make filename customizable
const input = fs.readFileSync(resolve(os.homedir(), 'timesheet.txt')).toString()
readLastLines
  .read(resolve(os.homedir(), 'timesheet.txt'), 100)
  .then((text) => {
    // debug('text=', text)
    console.log(new Reporter(timesheet(input, parseArguments([])), {reportDays: 1}).toString())
  });
