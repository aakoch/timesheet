import fs from 'fs'
import path from 'path'
import os from 'os'

const options = { debug: false, shouldOutputIntervals: false }

options.debug = process.argv.slice(2).some(arg => arg === '--debug')

debug('process.argv=', process.argv)

function createDateString(offsetMinutes) {
  const date = new Date()
  date.setMinutes(date.getMinutes() - offsetMinutes)
  const [month, day, year]       = [date.getMonth(), date.getDate(), date.getFullYear()];
  const [hours, minutes, timezoneOffset] = [date.getHours(), date.getMinutes(), date.getTimezoneOffset()];
  return `${year}-${(month + 1).toString().padStart(2, 0)}-${(day).toString().padStart(2, 0)}T${hours.toString().padStart(2, 0)}:${minutes.toString().padStart(2, 0)}${(timezoneOffset < 0 ? '+' : '-')}${(Math.floor(timezoneOffset / 60)).toString().padStart(2, 0)}:${(Math.floor(timezoneOffset % 60)).toString().padStart(2, 0)}`
}

function appendTimestamp(str, options = { offset: 0 }) {
  const dateStr = createDateString(options.offset)
  fs.appendFileSync(path.resolve(os.homedir() + '/timesheet.txt'), dateStr + ` ${str}\n`)
}

function debug(...objs) {
  if (options.debug)
    console.log(...objs)
}

export {
  appendTimestamp, debug
}