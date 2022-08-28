#! /usr/local/bin/node

// Copyright (c) 2022, Adam Koch. All rights reserved.

// This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

// This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

// You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.

/**
 * Use in conjunction with "login" and "logoff" aliases:
 *   login='echo $(gdate -Iminutes) login >> ~/timesheet.txt'
 *   logoff='echo $(gdate -Iminutes) logoff >> ~/timesheet.txt'
 */

import dayjs from 'dayjs'
import dayjsUtc from 'dayjs/plugin/utc.js'
import dayjsTimezone from 'dayjs/plugin/timezone.js'

dayjs.extend(dayjsUtc)
dayjs.extend(dayjsTimezone)

let clock = {
  now: () => {
    return global.clock ? global.clock.now() :  new Date()
  }
}

const debug = process.argv.includes('--debug') ? (...objs) => console.log(...objs) : () => {}

// should I use https://day.js.org/docs/en/plugin/duration ?
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
      strArr.push(' hour' + (Math.round(hours) === 1 ? ',  ' : 's, '))
      minutes = this.minutes % 60
    } else {
      strArr.push(' '.repeat(10))
    }
    strArr.push(Math.round(minutes).toString().padStart(2, ' '))
    strArr.push(' minute' + (Math.round(minutes) === 1 ? ' ' : 's'))
    return strArr.join('')
  }
}

class Interval {
  constructor(startInstant, endInstant, running = false) {
    this.startInstant = startInstant
    this.endInstant = endInstant
    this.duration = new Duration(this.timeBetween(startInstant, endInstant))
    this.running = running
  }
  timeBetween(startInstant, endInstant) {
    return (endInstant - startInstant) / 60000
  }
  toString() {
    const toTime = !!this.endInstant ? toTimeString(this.endInstant) : 'now  '
    return toTimeString(this.startInstant) + ' to ' + toTime + '   ' + this.duration.toString()
  }
}

class Event {
  constructor(instant, name) {
    this.instant = instant
    this.name = name
  }

  static parse(line) {
    const lineParts = line.split(' ')
    return new Event(new Date(lineParts[0]), lineParts[1])
  }
  get [Symbol.toStringTag]() {
    return `Event { instant: ${dayjs(this.instant).format('YYYY-MM-DDTHH:mm:ssZ[Z]')}, name: '${this.name}' }`
  }
}

class Summary {
  constructor(period, intervals, total) {
    this.period = period
    this.intervals = intervals
    this.total = total
  }
}

function convertToEvents(text) {
  return text
    .split('\n')
    .filter(line => line.trim().length)
    .filter(line => line.startsWith('2')) // might remove this at some point
    .map(line => {
      return Event.parse(line)
    })
}

function toDateString(date) {
  return dayjs(date).format('YYYY-MM-DD')
}

function toTimeString(date) {
  return dayjs(date).format('HH:mm')
}

function removeRepeats(groupedByDates) {
  const entries = Object.entries(groupedByDates).map(([key, events]) => {
    // can the reverse below be removed with a reduceRight here?
    const newIntervals = events.reduce((previousIterations, currentIteration) => {
      if (previousIterations[0] && currentIteration.name === previousIterations[0].name) {
        if (currentIteration.name === 'login') {
        } else if (currentIteration.name === 'logout' || currentIteration.name === 'logoff') {
          previousIterations[0] = currentIteration
        }
      } else {
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

function groupByDates(events) {
  return events.reduce((previousVal, currentVal) => {
    let dates = Object.assign({}, previousVal)
    const obj = currentVal
    const dateString = dayjs(currentVal.instant).format('YYYY-MM-DD')
    if (previousVal.hasOwnProperty(dateString)) {
      dates[dateString] = previousVal[dateString].concat(obj)
    } else {
      dates[dateString] = [obj]
    }
    return dates
  }, {})
}

// Cases:
// Normal: first event is login, last event is logoff
// Span days: last event of the day is login, first event of the following day is logoff - need to constrain
// No logoff: last event of the day is login, first event of the following day is login
// No login: first event of the day is logoff, last event of the previous day is logoff

function createInterval(beginningEvent, endingEvent, running = false) {
  return new Interval(beginningEvent.instant, endingEvent.instant, running)
}

function createIntervals(events, day) {
  debug('day=', day)
  let state = START
  const intervals = []
  for (let index = 0; index < events.length; index++) {
    const currentEvent = events[index]
    const nextEvent = index < events.length - 1 ? events[index + 1] : null
    if (currentEvent.name === 'login' && nextEvent === null) {
      debug('only 1 event')

      // Should I use https://day.js.org/docs/en/plugin/is-today ?
      if (day === toDateString(clock.now())) {
        intervals.push(createInterval(currentEvent, { instant: clock.now()}, true))
      } else {
        debug('Last event of the day was a login=', currentEvent)
        intervals.push('Last event of the day was a login at ' + toTimeString(currentEvent.instant))
      }
    } else if (currentEvent.name === 'login' && (nextEvent.name === 'logout' || nextEvent.name === 'logoff')) {
      const interval = createInterval(currentEvent, nextEvent)
      debug('interval=', interval)
      intervals.push(interval)
      index++
    } else if (state === START && (currentEvent.name === 'logout' || currentEvent.name === 'logoff')) {
      debug('First event of the day was a logoff=', currentEvent)
      intervals.push('First event of the day was a logoff at ' + toTimeString(currentEvent.instant))
    } else {
      debug('skipping event=', currentEvent)
    }
    state = NOT_START
  }
  return intervals
}

function calculateTotal(intervals) {
  return intervals.reduce((total, currentInterval) => {
    return total + (typeof currentInterval === 'string' ? 0
        : currentInterval.duration.minutes)
  }, 0)
}

const START = 0
const NOT_START = 1

function timesheet(input, options) {
  const events = convertToEvents(input)

  debug('typeof events=', typeof events)
  debug('options=', options)

  const groupedByDates = groupByDates(events)

  debug('groupedByDates=', groupedByDates)

  const uniqueGroupedByDates = removeRepeats(groupedByDates)

  debug('uniqueGroupedByDates=' + uniqueGroupedByDates)

  // const summary = createSummary()
  return Object.entries(uniqueGroupedByDates).map(([key, singleDayEvents]) => {
    const intervals = createIntervals(singleDayEvents, key)
    const total = calculateTotal(intervals)
    return new Summary(key, intervals, total)
  })
}

export { timesheet, groupByDates, toDateString, toTimeString, removeRepeats, Interval, Event, convertToEvents, Duration, Summary }
