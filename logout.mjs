#! /usr/local/bin/node

import { appendTimestamp, debug } from "./common.mjs"

const options = { offset: 0 }

process.argv.slice(2).forEach(arg => {
  debug('parsing arg: ', arg)
  if (arg === '-help') {
    console.log('Write...')
    process.exit()
  }
  else {
    try {
      options.offset = parseInt(arg)
      debug('optons.offset=' + options.offset)
    } catch (ignore) {}
  }
})

appendTimestamp('logout', options);