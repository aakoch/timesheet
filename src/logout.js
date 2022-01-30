#! /usr/local/bin/node

import { appendTimestamp, getOptions } from "./common.js"

appendTimestamp('logout', getOptions(process.argv.slice(2)));