/**
 * Parse arguments for timesheet.
 */
export default function parseArguments(args) {
  const options = { debug: false, outputIntervals: false, outputColor: true }

  const debug = process.argv.slice(2).includes('--debug') ? (...objs) => console.log(...objs) : () => {}

  debug('args=', args)

  const leftoverArgs = args.filter(arg => {
    if (arg === '--help' || arg === '-h') {
      console.log('Display hours worked per day. Options include\n  --debug\n  --printIntervals\n  --no-color')
      process.exit()
    }
    else if (arg === '--printIntervals') {
      options.outputIntervals = true
      return false
    }
    else if (arg === '--debug') {
      options.debug = true
      return false
    }
    else if (arg === '--no-color') {
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