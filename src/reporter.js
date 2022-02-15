import { Duration } from "./timesheet.js"
import chalk from "chalk"
import debugFunc from 'debug'
const debug = debugFunc('timesheet/Reporter')

class Reporter {
  constructor(summaries, options = { outputIntervals: true, outputColor: true }) {
    this.summaries = summaries
    this.printIntervals = options.outputIntervals
    this.outputColor = options.outputColor
  }

  humanize(minutes) {
    return new Duration(minutes).toString()
  }

  toString() {
    return this.summaries
      .map((summary) => {
        let colorFunction;
        if (!this.outputColor) {
          colorFunction = (input) => input;
        } else if (summary.total.minutes > 24 * 60) {
          colorFunction = chalk.red
        } else {
          colorFunction = chalk.blue
        }
        let intervalsString = ""
        if (this.printIntervals) {
          intervalsString =
            summary.intervals
              .map((interval) => {
                return ` - ${interval}`
              })
              .join("\n") + "\n"
        }
        const lastInterval = summary.intervals[summary.intervals.length - 1]
        debug('last interval=', lastInterval)
        const running = lastInterval?.running
        const andCounting = running ? " and counting" : ""
        const runningMinutes = running ? lastInterval.duration.minutes : 0
        return intervalsString + colorFunction(`${summary.period} total is ${this.humanize( summary.total + runningMinutes )}${andCounting}`)
      })
      .join("\n");
  }
}

export default Reporter
