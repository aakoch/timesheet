#! /usr/local/bin/node

import { appendTimestamp, getOptions } from "./common.js"

appendTimestamp('login', getOptions(process.argv.slice(2)))