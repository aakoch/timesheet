// Copyright (c) 2022, Adam Koch. All rights reserved.

import tap from "tap";
import fs from "fs";
import path from "path";
import { simpleProjectRootDir } from "@foo-dog/utils";
import {
  timesheet,
  removeRepeats,
  groupByDates,
  Interval,
  Event,
  convertToEvents
} from "../src/timesheet.js"
import Reporter from '../src/reporter.js'
import parseArguments from "../src/parse_arguments.js";
import debugFunc from 'debug'
const debug = debugFunc('timesheet/test')

const filename = simpleProjectRootDir() + "/test/example.txt";

// const debug = process.argv.includes("--debug")
//   ? (...objs) => console.log(...objs)
//   : () => {};

const options = Object.assign(parseArguments(process.argv.slice(2)), {
  outputColor: false,
});

tap.test("remove intervals of the same event next to each other", (t) => {
  const input = fs.readFileSync(path.resolve(filename)).toString();

  const events = input
    .split("\n")
    .filter((line) => line.trim().length)
    .filter((line) => line.startsWith("2")) // might remove this at some point
    .map((line) => {
      return Event.parse(line);
    });

    const step1 = groupByDates(events);
    debug('step1=', step1)
    
  const actual = removeRepeats(step1);

  debug("actual=", actual);

  const expected = {
    "2022-01-27": [
      {
        instant: new Date("2022-01-27T14:00:00.000Z"),
        name: "login",
      },
      {
        instant: new Date("2022-01-27T18:00:00.000Z"),
        name: "logout",
      },
      {
        instant: new Date("2022-01-27T19:00:00.000Z"),
        name: "login",
      },
      {
        instant: new Date("2022-01-28T00:00:00.000Z"),
        name: "logout",
      },
    ],
  };

  debug("expected=", expected);

  t.same(actual, expected);

  t.end();
});

tap.test("testing removing intervals from just one entry", (t) => {
  const input = fs
    .readFileSync(path.resolve(filename))
    .toString()
    .split("\n")[0];

  const events = convertToEvents(input)

  const step1 = groupByDates(events);

  const actual = removeRepeats(step1);

  debug("actual=", actual);

  t.same(actual["2022-01-27"][0].name, "login");

  t.end();
});

tap.test("no intervals printed", (t) => {
  const input = fs.readFileSync(path.resolve(filename)).toString();

  const actual = timesheet(input, options);

  debug("actual=", actual);

  const expected = "2022-01-27 total is  9 hours,  0 minutes";

  debug("expected=", expected);

  t.same(new Reporter(actual, options).toString(), expected);

  t.end();
});

tap.test("running total", (t) => {
  const input = fs
    .readFileSync(path.resolve(filename))
    .toString()
    .split("\n")[0];

  const actual = timesheet(input, options);

  debug("actual=", actual);

  t.match(new Reporter(actual, options).toString(), /.*and counting/);

  t.end();
});

tap.test("only minutes", (t) => {
  const input = fs
    .readFileSync(
      path.resolve(simpleProjectRootDir() + "/test/only_minutes.txt")
    )
    .toString();

  const actual = timesheet(input, options);

  debug("actual=", actual);

  const expected = "2022-01-27 total is            1 minute ";

  debug("expected=", expected);

  t.same(new Reporter(actual, options).toString(), expected);

  t.end();
});

tap.test("intervals printed", (t) => {
  const input = fs.readFileSync(path.resolve(filename)).toString();

  const actual = timesheet(input, options);

  debug("actual=", actual);

  const expected = " - 08:00 to 12:00  4 hours,  0 minutes\n - 13:00 to 18:00  5 hours,  0 minutes\n2022-01-27 total is  9 hours,  0 minutes";

  debug("expected=", expected);

  options.outputIntervals = true

  t.same(new Reporter(actual, options).toString(), expected);

  t.end();
});

