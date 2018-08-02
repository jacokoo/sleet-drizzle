const fs = require('fs')
const {compile} = require('sleet')
const {overrideContext} = require('../build/sleet-drizzle')

const input = fs.readFileSync(`${__dirname}/test.sleet`, 'utf-8')
console.log(input)

console.log(compile(input, {drizzle: {overrideContext}}).content)

