#! /usr/local/bin/node

/**
 * Use in conjunction with "login" and "logout" aliases:
 *   login='echo $(gdate -Iminutes) login >> ~/timesheet.txt'
 *   logout='echo $(gdate -Iminutes) logout >> ~/timesheet.txt'
 */

import chalk from 'chalk';

const debug = process.argv.includes('--debug') ? (...objs) => console.log(...objs) : () => {}

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

function createInterval(previousEvent, currentEvent, currentIntervalMinutes) {
  const interval = {}
  const toTime = currentEvent.event === 'currentTime' ? 'now  ' : currentEvent.time.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  interval[toTimeString(previousEvent.time) + ' to ' + toTime] =
    new Duration(currentIntervalMinutes)
  return interval
}

// function removeRepeats(groupedByDates) {
//   return groupedByDates
// }

function toDateString(date) {
  return date.getFullYear() + '-' + ('' + (date.getMonth() + 1)).padStart(2, '0') + '-' + ('' + date.getDate()).padStart(2, '0')
}

function toTimeString(date) {
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

function removeRepeats(groupedByDates) {
  const entries = Object.entries(groupedByDates).map(([key, intervals]) => {

    // can the reverse below be removed with a reduceRight here?
    const newIntervals = intervals.reduce((previousIterations, currentIteration) => {
      if (previousIterations[0] && currentIteration.event === previousIterations[0].event) {
        if (currentIteration.event === 'login') {

        }
        else if (currentIteration.event === 'logout') {
          previousIterations[0] = currentIteration
        }
      }
      else {
        previousIterations.unshift(currentIteration)
      }
      return previousIterations
    }, [])
    // can this reverse be replaced with a reduceRight above?
    return [key, newIntervals.reverse()]
  })
  debug('entries=', entries)
  return Object.fromEntries(entries)
}

function groupByDates(input, removeRepeats) {
  debug('input=', input)
  debug('input.split(\n)=', input.split('\n'))
  const groupedByDates = input
    .split('\n')
    .filter(line => line.startsWith('2'))
    .map(line => line.split(' '))
    .map(line => [new Date(line[0]), line[1]])
    .reduce((previousVal, currentVal) => {
      let dates = Object.assign({}, previousVal)
      const obj = {
        time: currentVal[0],
        event: currentVal[1]
      }
      // const dateString = currentVal[0].toLocaleDateString('en-GB')
      const dateString = toDateString(currentVal[0])
      if (previousVal.hasOwnProperty(dateString)) {
        dates[dateString] = previousVal[dateString].concat(obj)
      }
      else {
        dates[dateString] = [obj]
      }
      // console.log(previousVal)
      // console.log(currentVal)
      return dates
    }, {})

  return groupedByDates
}

function timesheet(input, options) {
  const retArr = []

  debug('input=', input)
  debug('options=', options)

  const groupedByDates = groupByDates(input)

  debug('groupedByDates=', groupedByDates)

  const dupsRemoved = removeRepeats(groupedByDates)

  debug('dupsRemoved=' + dupsRemoved)

  Object.keys(dupsRemoved).forEach(day => {
    let singleDayEvents = dupsRemoved[day]
    singleDayEvents.push({ event: 'currentTime', time: new Date(), usingRunningIntervals: true })
    debug(singleDayEvents)
    const duration = singleDayEvents.reduce((previousEvent, currentEvent) => {
      const retObj = Object.assign({ intervals: [] }, previousEvent, { time: currentEvent.time, event: currentEvent.event })
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

    if (duration.hasOwnProperty('total')) {
      const appendix = duration.event === 'running' ? ' and counting' : ''
      debug('duration.total=', duration.total)
      let colorFunction
      debug('options.outputColor=', options.outputColor)
      if (!options.outputColor) {
        colorFunction = (input) => input
      }
      else if (duration.total.minutes > 24 * 60) {
        colorFunction = chalk.red
      }
      else {
        colorFunction = chalk.blue
      }
      retArr.push(colorFunction(day + ' total is ' + duration.total.toString() + appendix))
    }
    else if (duration.hasOwnProperty('running')) {
      console.log(day + ' running time is ' + duration.running.toString())
    }
    if (options.shouldOutputIntervals && (duration.hasOwnProperty('intervals') || duration.hasOwnProperty('runningIntervals'))) {
      // const intervalKey = 
      debug(duration)
      retArr.push(duration.intervals.map(interval => (debug(interval) && false) || ' - ' + Object.keys(interval) + ' = ' + Object.values(interval)).join('\n'))
    }

  })

  return retArr.join('\n')
}

export {
  timesheet,
  groupByDates,
  toDateString,
  toTimeString,
  removeRepeats
}

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