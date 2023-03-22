import tap from 'tap'
import {timesheet} from '../src/timesheet.ts'
import debugFunc from 'debug'
import Reporter from "../src/reporter.js";
import { Options } from '../src/common';

const debug = debugFunc('timesheet/test')

tap.test('Should display summary for 2 days', t => {

  (global as any).clock = { now: () => new Date('2022-08-11T13:10-05:00') }

  const testEntries = `
2022-08-10T13:08-05:00 login
2022-08-10T14:30-05:00 logoff
2022-08-10T16:57-05:00 logoff
2022-08-10T17:21-05:00 login
2022-08-11T07:23-05:00 login
2022-08-11T07:32-05:00 logoff
2022-08-11T07:47-05:00 login
2022-08-11T10:56-05:00 logoff
2022-08-11T12:28-05:00 login
2022-08-11T12:30-05:00 login
`
  const options: Options = { printIntervals: true }
  const actual: any = timesheet(testEntries, options)
  debug("actual=", actual)

  let report = new Reporter(actual, options).toString();
  debug("report=", report)
  t.same(actual[1].total, 240)
  t.same(report.split('\n')[0], '2022-08-10 total is  3 hours, 49 minutes', 'Should not include \'and counting\'') // <-- Issue 8
  t.same(report.split('\n')[1], '2022-08-11 total is  4 hours,  0 minutes and counting')
  t.end()
})
