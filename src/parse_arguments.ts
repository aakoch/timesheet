/**
 * Parse arguments for timesheet.
 */

// Copyright (c) 2022, Adam Koch. All rights reserved.

// This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

// This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

// You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.

import { Options } from "./Options"
import readVersion from './read_version.js'

export default function parseArguments(args: string[]) {
  const options: Options = { debug: false, outputIntervals: false, outputColor: true }

  const debug: Function = process.argv.slice(2).includes('--debug') ? (...objs: any) => console.log(...objs) : () => {}

  debug('args=', args)

  const leftoverArgs = args.filter((arg: any) => {
    if (arg === '--help' || arg === '-h') {
      console.log('Display hours worked per day. Options include\n  --debug\n  --printIntervals\n  --no-color')
      process.exit()
    } else if (arg === '--printIntervals') {
      options.outputIntervals = true
      return false
    } else if (arg === '--printWeekly') {
      options.outputWeekly = true
      return false
    } else if (arg === '--version' || arg === '-v') {
      console.log('timesheet v' + readVersion())
      process.exit()
    } else if (arg === '--debug') {
      options.debug = true
      return false
    } else if (arg === '--no-color') {
      options.outputColor = false
      return false
    }
    return true
  })

  if (leftoverArgs.length > 0) {
    console.error('Invalid options: ' + leftoverArgs.join(', '))
  }

  debug('outputIntervals=', options.outputIntervals)

  return options
}
