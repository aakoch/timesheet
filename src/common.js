// Copyright (c) 2022, Adam Koch. All rights reserved.

// This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

// This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

// You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.

import fs from 'fs'
import path from 'path'
import os from 'os'
import dayjs from 'dayjs'
const test = !!import.meta.url.endsWith('?test')
// import debugFunc from 'debug'
// const debug = debugFunc('@foo-dog/utils:common')

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

function appendTimestamp(str, opt) {
  const options = Object.assign({ filename: os.homedir() + '/timesheet.txt', offset_hours: 0, offset_minutes: 0 }, opt)
  console.log('options=', options)
  const dateStr = createDateString(options.offset_hours, options.offset_minutes)
  fs.appendFileSync(path.resolve(options.filename), dateStr + ` ${str}\n`)
}

function getOptions(args) {
  const options = { offset_hours: 0, offset_minutes: 0 }

  args.forEach(arg => {
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

export { createDateString, appendTimestamp, getOptions }
