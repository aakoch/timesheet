// Copyright (c) 2022, Adam Koch. All rights reserved.

// This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

// This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

// You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.

import fs from 'fs'
import path from 'path'
import os from 'os'

// const options = { debug: false, shouldOutputIntervals: false }

// options.debug = arguments.some(arg => arg === '--debug')
// // options.debug = process.argv.slice(2).some(arg => arg === '--debug')

// debug('process.argv=', process.argv)

function createDateString(offsetMinutes, date = new Date()) {
  date.setMinutes(date.getMinutes() - offsetMinutes)
  const [month, day, year]       = [date.getMonth() + 1, date.getDate(), date.getFullYear()].map(val => val.toString())
  const [hours, minutes, timezoneOffset] = [date.getHours(), date.getMinutes(), date.getTimezoneOffset()]
  return `${year}-${month.padStart(2, 0)}-${(day).padStart(2, 0)}T${hours.toString().padStart(2, 0)}:${minutes.toString().padStart(2, 0)}${(timezoneOffset < 0 ? '+' : '-')}${(Math.floor(timezoneOffset / 60)).toString().padStart(2, 0)}:${(Math.floor(timezoneOffset % 60)).toString().padStart(2, 0)}`
}

function appendTimestamp(str, opt) {
  const options = Object.assign({}, opt, { filename: os.homedir() + '/timesheet.txt', offset: 0 })
  const dateStr = createDateString(options.offset)
  fs.appendFileSync(path.resolve(options.filename), dateStr + ` ${str}\n`)
}

function getOptions(args) {
  const options = { offset: 0 }

  args.forEach(arg => {
    if (arg === '--help' || arg === '-h') {
      console.log(`Write a timestamp to ~/timesheet.txt. \n  Usage: ${process.argv0} ${process.argv[1]} [offset in minutes]`)
      process.exit()
    }
    else {
      try {
        options.offset = parseInt(arg)
      } catch (ignore) {}
    }
  })
  return options
}

export {
  createDateString, appendTimestamp, getOptions
}