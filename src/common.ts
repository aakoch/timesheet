// Copyright (c) 2022, Adam Koch. All rights reserved.

// This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

// This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

// You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
import fs from 'fs'
import path from 'path'
import os from 'os'
import dayjs from 'dayjs';
import chalk from 'chalk'
import { Options } from './Options';
// import { debug } from 'console'
const test = !!import.meta.url.endsWith('?test')
// import localizedFormat from 'dayjs/plugin/localizedFormat.js'
// import debugFunc from 'debug'
// const debug = debugFunc('@foo-dog/utils:common')

// dayjs.extend(localizedFormat)

let clock = {
  now: () => {
    return (global as any).clock ? (global as any).clock.now() :  new Date()
  }
}

function createDateString(offsetHours = 0, offsetMinutes = 0, date = new Date()) {
  if (typeof offsetHours === 'object' && offsetMinutes === 0) {
    date = offsetHours
    offsetHours = 0
  }
  if (typeof offsetMinutes === 'object') {
    date = offsetMinutes
    offsetMinutes = 0
  }
  const dateToUse = dayjs(date).subtract(offsetHours, 'h').subtract(offsetMinutes, 'm')
  return dayjs(dateToUse).format('YYYY-MM-DDTHH:mmZ')
}

function appendTimestamp(str: string, opt: Options) {
  const options = Object.assign({ filename: os.homedir() + '/timesheet.txt', offset_hours: 0, offset_minutes: 0 }, opt)
  const dateStr = createDateString(options.offset_hours, options.offset_minutes)
  fs.appendFileSync(path.resolve(options.filename), dateStr + ` ${str}\n`)
  console.log(`${chalk.cyanBright('Success!')} ${chalk.bold(str)} event added to ${path.basename(options.filename)} at ${chalk.bold(dateStr)}`)
}

function getOptions(args: string[]): Options {
  const options: Options = { offset_hours: 0, offset_minutes: 0 }

  args.forEach((arg: string) => {
    if (arg === '--help' || arg === '-h') {
      console.log(`Write a timestamp to ~/timesheet.txt. \n  Usage: ${process.argv0} ${process.argv[1]} [offset in minutes]`)
      process.exit()
    } else if (arg.endsWith('h')) {
      try {
        options.offset_hours = parseInt(arg.slice(0, -1))
      } catch (ignore) {
        console.log('Could not parse "' + arg + '". Did you mean "[number of hours]h"?')
        process.exit()
      }
    } else if (arg.endsWith('m')) {
      try {
        options.offset_minutes = parseInt(arg.slice(0, -1))
      } catch (ignore) {
        console.log('Could not parse "' + arg + '". Did you mean "[number of minutes]m"?')
        process.exit()
      }
    } else if (arg.includes(':')) {
      try {
        // options.time is not implemented. Instead I just am calculating the difference and using
        // the established offset_* fields
        const timeParts: string[] = arg.split(':')
        options.time = dayjs(clock.now()).hour(parseInt(timeParts[0], 10)).minute(parseInt(timeParts[1], 10)).startOf('minute')
        options.offset_hours = dayjs(clock.now()).hour() - options.time.hour()
        options.offset_minutes = dayjs(clock.now()).minute() - options.time.minute()
      } catch (ignore) {
        console.log('Could not parse "' + arg + '". Did you mean "hh:mm"?')
        console.error('Error', ignore)
        process.exit()
      }
    } else {
      try {
        parseInt(arg)
        console.log('I do not know the units for "' + arg + '". Please append "h" or "m".')
        if (!test) process.exit()
      } catch (ignore) {}
    }
  })

  return options
}

export { createDateString, appendTimestamp, getOptions, Options }
