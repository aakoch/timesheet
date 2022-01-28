/**
 * Use in conjunction with "login" and "logout" aliases:
 *   login='echo $(gdate -Iminutes) login >> ~/timesheet.txt'
 *   logout='echo $(gdate -Iminutes) logout >> ~/timesheet.txt'
 */

import fs from 'fs'
import path from 'path'
import os from 'os'

class Duration {
  constructor(minutes) {
    this.minutes = minutes
  }
  toString() {
    const strArr = []
    const hours = Math.floor(this.minutes / 60)
    let minutes = this.minutes
    if (hours) {
      strArr.push(hours.toString().padStart(2, ' '))
      strArr.push(" hour" + (Math.round(hours) == 1 ? " " : "s") + ", ")
      minutes = this.minutes % 60
    }
    else {
      strArr.push(' '.repeat(10))
    }
    strArr.push(Math.round(minutes).toString().padStart(2, ' '))
    strArr.push(" minute" + (Math.round(minutes) == 1 ? " " : "s"))
    return strArr.join('')
  }
}

function debug(...objs) {
  if (options.debug)
    console.log(...objs)
}

function createInterval(previousEvent, currentEvent, currentIntervalMinutes) {
  const interval = {}
  const toTime = currentEvent.event === 'currentTime' ? 'now  ' : currentEvent.time.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  interval[previousEvent.time.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) + ' to ' + toTime] = 
    new Duration(currentIntervalMinutes)
  return interval
}

const options = { debug: false, shouldOutputIntervals: false }

options.debug = process.argv.slice(2).some(arg => arg === '--debug')

debug('process.argv=', process.argv)

process.argv.slice(2).forEach(arg => {
  debug('parsing arg: ', arg)
  if (arg === '--help') {
    console.log('Display hours worked per day. Options include\n  --debug\n  --printIntervals')
    process.exit()
  }
  else if (arg === '--printIntervals') {
    options.shouldOutputIntervals = true
  }
})

debug('shouldOutputIntervals=', options.shouldOutputIntervals)

const groupedByDates = fs.readFileSync(path.resolve(os.homedir() + '/timesheet.txt')).toString()
.split('\n').filter(line => line.startsWith('2'))
.map(line =>line.split(' '))
.map(line => [new Date(line[0]), line[1]])
.reduce((previousVal, currentVal) => {
  let dates = Object.assign({}, previousVal)
  const obj = { 
    time: currentVal[0],
    event: currentVal[1]
  }
  // const dateString = currentVal[0].toLocaleDateString('en-GB')
  const dateString = currentVal[0].getFullYear() + '-' + ('' + (currentVal[0].getMonth() + 1)).padStart(2, '0') + '-' + ('' + currentVal[0].getDate()).padStart(2, '0')
  if (previousVal.hasOwnProperty(dateString)) {
    dates[dateString] = previousVal[dateString].concat(obj)
  }
  else {
    dates[dateString] = [ obj ]
  }
  // console.log(previousVal)
  // console.log(currentVal)
  return dates
}, {})

debug(groupedByDates)

Object.keys(groupedByDates).forEach(day => { 
  let singleDayEvents = groupedByDates[day]
  singleDayEvents.push({ event: 'currentTime', time: new Date(), usingRunningIntervals: true })
  debug(singleDayEvents)
  const duration = singleDayEvents.reduce((previousEvent, currentEvent) => {
    const retObj = Object.assign({ intervals: []}, previousEvent, { time: currentEvent.time, event: currentEvent.event })
    const currentIntervalMinutes = (currentEvent.time - previousEvent.time) / 60000
    debug('*** previousEvent', previousEvent)
    debug('*** currentEvent', currentEvent)


    if ((previousEvent.event.includes('in') && currentEvent.event.includes('out')) ||
        (currentEvent.event === 'currentTime' && previousEvent.event === 'login')) {
      retObj.total = new Duration((previousEvent.total?.minutes ?? 0) + currentIntervalMinutes)
      retObj.intervals.push(createInterval(previousEvent, currentEvent, currentIntervalMinutes))
  
      if (currentEvent.event === 'currentTime' && previousEvent.event === 'login') {
        retObj.running = new Duration(currentIntervalMinutes)
        retObj.event = 'running'
      }
    }
    return retObj
  })

  delete duration.time
  // delete duration.event

  if (duration.hasOwnProperty('total')) {
    const appendix = duration.event === 'running' ? ' and counting' : ''
    console.log(day + ' total is ' + duration.total.toString() + appendix)
    // if (options.shouldOutputIntervals) {
    //   console.log(duration.intervals.map(interval => ' - ' + Object.keys(interval) + ' = ' + Object.values(interval)).join('\n'))
    // }
  } 
  else if (duration.hasOwnProperty('running')) {
    console.log(day + ' running time is ' + duration.running.toString())
  }
  if (options.shouldOutputIntervals && (duration.hasOwnProperty('intervals') || duration.hasOwnProperty('runningIntervals'))) {
    // const intervalKey = 
    debug(duration)
    console.log(duration.intervals.map(interval => (debug(interval) && false) || ' - ' + Object.keys(interval) + ' = ' + Object.values(interval)).join('\n'))
  }
})

// .map((d1, idx, arr) => {
//   if (idx < arr.length - 1) {
//     const retArr = []
//     if (d1[0].getDate() != arr[idx+1][0].getDate()) {
//       retArr.push('='.repeat(20))
//     }
//     retArr.push([d1[0].toLocaleDateString(), 'from', d1[0].toLocaleTimeString(), 'to', arr[idx+1][0].toLocaleTimeString(), 'was', (arr[idx+1][0] - d1[0])/60000, 'minutes'].join(' '))
//     return retArr
//   }
// }).join('\n'))