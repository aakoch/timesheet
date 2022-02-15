/**
 * Parse arguments for timesheet.
 */

// Copyright (c) 2022, Adam Koch. All rights reserved.

// This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

// This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

// You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.

export default function parseArguments(args) {
  const options = { debug: false, outputIntervals: false, outputColor: true };

  const debug = process.argv.slice(2).includes("--debug")
    ? (...objs) => console.log(...objs)
    : () => {};

  debug("args=", args);

  const leftoverArgs = args.filter((arg) => {
    if (arg === "--help" || arg === "-h") {
      console.log(
        "Display hours worked per day. Options include\n  --debug\n  --printIntervals\n  --no-color"
      );
      process.exit();
    } else if (arg === "--printIntervals") {
      options.outputIntervals = true;
      return false;
    } else if (arg === "--debug") {
      options.debug = true;
      return false;
    } else if (arg === "--no-color") {
      options.outputColor = false;
      return false;
    }
    return true;
  });

  if (leftoverArgs.length > 0) {
    console.error("Invalid options: " + leftoverArgs.join(", "));
  }

  debug("outputIntervals=", options.outputIntervals);

  return options;
}
