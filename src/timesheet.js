#! /usr/local/bin/node

// Copyright (c) 2022, Adam Koch. All rights reserved.

// This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

// This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

// You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.

/**
 * Use in conjunction with "login" and "logout" aliases:
 *   login='echo $(gdate -Iminutes) login >> ~/timesheet.txt'
 *   logout='echo $(gdate -Iminutes) logout >> ~/timesheet.txt'
 */

import chalk from "chalk";
import dayjs from "dayjs";
import dayjsUtc from "dayjs/plugin/utc.js";
import dayjsTimezone from "dayjs/plugin/timezone.js";
dayjs.extend(dayjsUtc);
dayjs.extend(dayjsTimezone);

const debug = process.argv.includes("--debug")
  ? (...objs) => console.log(...objs)
  : () => {};

class Duration {
  constructor(minutes) {
    this.minutes = minutes;
  }
  toString() {
    const strArr = [];
    const hours = Math.floor(this.minutes / 60);
    let minutes = this.minutes;
    if (hours) {
      strArr.push(hours.toString().padStart(2, " "));
      strArr.push(" hour" + (Math.round(hours) == 1 ? ",  " : "s, "));
      minutes = this.minutes % 60;
    } else {
      strArr.push(" ".repeat(10));
    }
    strArr.push(Math.round(minutes).toString().padStart(2, " "));
    strArr.push(" minute" + (Math.round(minutes) == 1 ? " " : "s"));
    return strArr.join("");
  }
}

class Interval {
  constructor(startInstant, endInstant, running) {
    this.startInstant = startInstant;
    this.endInstant = endInstant;
    this.duration = new Duration(this.timeBetween(startInstant, endInstant));
    this.running = running
  }
  timeBetween(startInstant, endInstant) {
    return (endInstant - startInstant) / 60000;
  }
  toString() {
    const toTime = !!this.endInstant ? toTimeString(this.endInstant) : "now  "
    return toTimeString(this.startInstant) + " to " + toTime + ' ' + this.duration.toString()
  }
}

class Event {
  constructor(instant, name) {
    this.instant = instant;
    this.name = name;
  }

  static parse(line) {
    const lineParts = line.split(" ");
    return new Event(new Date(lineParts[0]), lineParts[1]);
  }

  get [Symbol.toStringTag]() {
    return `Event { instant: ${dayjs(this.instant).format(
      "YYYY-MM-DDTHH:mm:ssZ[Z]"
    )}, name: '${this.name}' }`;
  }
}

class EventAdapter extends Event {
  constructor(eventLikeObject) {
    super(eventLikeObject.event, eventLikeObject.instant);
    this.usingRunningIntervals = eventLikeObject.usingRunningIntervals;
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
    .split("\n")
    .filter((line) => line.trim().length)
    .filter((line) => line.startsWith("2")) // might remove this at some point
    .map((line) => {
      return Event.parse(line);
    });
}

function toDateString(date) {
  return dayjs(date).format("YYYY-MM-DD");
}

function toTimeString(date) {
  return dayjs(date).format("HH:mm");
}

function removeRepeats(groupedByDates) {
  const entries = Object.entries(groupedByDates).map(([key, events]) => {
    // can the reverse below be removed with a reduceRight here?
    const newIntervals = events.reduce(
      (previousIterations, currentIteration) => {
        if (
          previousIterations[0] &&
          currentIteration.name === previousIterations[0].name
        ) {
          if (currentIteration.name === "login") {
          } else if (currentIteration.name === "logout") {
            previousIterations[0] = currentIteration;
          }
        } else {
          previousIterations.unshift(currentIteration);
        }
        return previousIterations;
      },
      []
    );
    // can this reverse be replaced with a reduceRight above?
    return [key, newIntervals.reverse()];
  });
  debug("entries=", entries);
  return Object.fromEntries(entries);
}

function groupByDates(events, removeRepeats) {
  const groupedByDates = events.reduce((previousVal, currentVal) => {
    let dates = Object.assign({}, previousVal);
    const obj = currentVal;
    const dateString = dayjs(currentVal.instant).format("YYYY-MM-DD");
    if (previousVal.hasOwnProperty(dateString)) {
      dates[dateString] = previousVal[dateString].concat(obj);
    } else {
      dates[dateString] = [obj];
    }
    return dates;
  }, {});

  return groupedByDates;
}

class StartPeriodEvent extends Event {
  static from(event) {
    const instant = dayjs(event.instant).startOf('day')
    return new Event(instant, 'startOfPeriod')
  }
}
class EndPeriodEvent extends Event {
  static from(event) {
    const instant = Math.min(new Date(), dayjs(event.instant))
    debug('instant=', instant)
    return new Event(instant, 'endOfPeriod')
  }
}

function createIntervals(events) {
  debug('events=', events)
  const intervals = []
  let running = false
  for (let index = 0; index < events.length;) {
    running = false
    const loginEvent = events[index].name == 'login' ? events[index] : StartPeriodEvent.from(events[index])
    let logoutEvent
    if (index + 1 < events.length && events[index + 1].name == 'logout') {
      logoutEvent = events[index + 1]
    }
    else {
      logoutEvent = EndPeriodEvent.from(events[index])
      running = true
    }

    intervals.push(new Interval(loginEvent.instant, logoutEvent.instant, running))

    if (loginEvent != null) index++
    if (logoutEvent != null) index++
  }
  return intervals
}

function calculateTotal(intervals) {
  let total = intervals.reduce((total, currentInterval) => {
    return total + currentInterval.duration.minutes
  }, 0)

  return total
  // for (let index = 0; index < events.length; index += 2) {
  //   const loginEvent = events[index];
  //   const logoutEvent = events[index + 1]
  //   intervals.push(new Interval(loginEvent.instant, logoutEvent.instant))
  // }
  // return intervals
}

// function summarizePeriod(eventsForPeriod) {

//   const retArr = [];
//   let runningTotal = 0;
//   for (let index = 1; index < eventsForPeriod.length; index++) {
//     const singleDayEvent = eventsForPeriod[index];
//     const currentIntervalMinutes =
//       (singleDayEvent.instant - eventsForPeriod[index - 1].instant) / 60000;
//     let total = new Duration(runningTotal + currentIntervalMinutes);
//     let interval = createInterval(
//       eventsForPeriod[index - 1],
//       singleDayEvent,
//       currentIntervalMinutes
//     );
//     let retObj = { intervals: [] };
//     retObj.total = total;
//     retObj.intervals.push(interval);
//     if (
//       singleDayEvent.name === "currentTime" &&
//       eventsForPeriod[index - 1].name === "login"
//     ) {
//       retObj.running = new Duration(currentIntervalMinutes);
//       retObj.name = "running";
//     }
//     retArr.push(retObj);
//   }
//   return ;
// }

function timesheet(input, options) {
  const events = convertToEvents(input);

  debug("typeof events=", typeof events);
  debug("options=", options);

  // const groupByHour = groupByHour(events)

  const groupedByDates = groupByDates(events);

  debug("groupedByDates=", groupedByDates);

  const dupsRemoved = removeRepeats(groupedByDates);

  debug("dupsRemoved=" + dupsRemoved);

  // const summary = createSummary()
  const summaries = Object.entries(dupsRemoved).map(([key, val]) => {
    const singleDayEvents = val
    debug(singleDayEvents)
    
  // }

  // Object.keys(dupsRemoved).forEach((day) => {
  //   let singleDayEvents = dupsRemoved[day];
    // singleDayEvents.push(
    //   new EventAdapter({
    //     event: "currentTime",
    //     time: new Date(),
    //     usingRunningIntervals: true,
    //   })
    // )

    
    const intervals = createIntervals(singleDayEvents)
    const total = calculateTotal(intervals)
    // const summary = summarizePeriod(singleDayEvents);

    // console.log("summary=", summary);

    // delete summary.time;

    // if (summary.hasOwnProperty("total")) {
    //   const appendix = summary.name === "running" ? " and counting" : "";
    //   debug("duration.total=", summary.total);
    //   let colorFunction;
    //   debug("options.outputColor=", options.outputColor);
    //   if (!options.outputColor) {
    //     colorFunction = (input) => input;
    //   } else if (summary.total.minutes > 24 * 60) {
    //     colorFunction = chalk.red;
    //   } else {
    //     colorFunction = chalk.blue;
    //   }
    //   retArr.push(
    //     colorFunction(day + " total is " + summary.total.toString() + appendix)
    //   );
    // } else if (summary.hasOwnProperty("running")) {
    //   console.log(day + " running time is " + summary.running.toString());
    // }
    // if (
    //   options.outputIntervals &&
    //   (summary.hasOwnProperty("intervals") ||
    //     summary.hasOwnProperty("runningIntervals"))
    // ) {
    //   // const intervalKey =
    //   debug("duration=", summary);
    //   retArr.push(
    //     summary.intervals
    //       .map(
    //         (interval) =>
    //           (debug(interval) && false) ||
    //           " - " + Object.keys(interval) + " = " + Object.values(interval)
    //       )
    //       .join("\n")
    //   );
    // }
    return new Summary(key, intervals, total)
  })

  return summaries;
}

export {
  timesheet,
  groupByDates,
  toDateString,
  toTimeString,
  removeRepeats,
  Interval,
  Event,
  convertToEvents,
  Duration
};
