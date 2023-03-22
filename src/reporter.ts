#! /usr/local/bin/node

// Copyright (c) 2022, Adam Koch. All rights reserved.

// This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

// This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

// You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.

import { Duration } from './timesheet.ts'
import chalk from 'chalk'
import debugFunc from 'debug'
const debug = debugFunc('timesheet/Reporter')

class Reporter {
  public printIntervals: boolean;
  public outputColor: boolean;
  public reportDays: boolean;

  constructor(public summaries: any, options: any) {
    const opts = Object.assign({ outputIntervals: false, outputColor: false, reportDays: 14 }, options)
    this.summaries = summaries
    this.printIntervals = opts.outputIntervals
    this.outputColor = opts.outputColor
    this.reportDays = opts.reportDays
  }

  humanize(minutes: number) {
    return new Duration(minutes).toString()
  }

  toString() {
    return this.summaries
      .slice(-this.reportDays)
      .map((summary: any, index: any, array: any) => {
        let colorFunction
        if (!this.outputColor) {
          colorFunction = (input: any) => input
        } else if (summary.total.minutes > 24 * 60) {
          colorFunction = chalk.red
        } else {
          colorFunction = chalk.blue
        }
        let intervalsString = ''
        if (this.printIntervals) {
          debug('summary.intervals=', summary.intervals);
          intervalsString =
            summary.intervals
              .map((interval: any) => {
                return ` - ${interval}`
              })
              .join('\n') + '\n'
        }
        const lastInterval = summary.intervals[summary.intervals.length - 1]
        debug('last interval=', lastInterval)
        debug('index=', index)
        debug('array.length=', array.length)
        const running = (typeof lastInterval === 'string' || lastInterval?.running) && index === array.length - 1
        debug('running=', running)
        const andCounting = running ? ' and counting' : ''
        // const runningMinutes = running ? lastInterval.duration.minutes : 0
        return intervalsString + colorFunction(`${summary.period} total is ${this.humanize(summary.total)}${andCounting}`)
      })
      .join('\n')
  }
}

export default Reporter
