const fs = require('fs')
const {compile} = require('sleet')
const {plugin} = require('../lib')

const input = fs.readFileSync(`${__dirname}/test.sleet`, 'utf-8')
console.log(input)

const code = compile(input, {
    plugins: {drizzle: plugin},
    sourceFile: `${__dirname}/test.sleet`
}).code
console.log(code)

fs.writeFileSync(`${__dirname}/test-output.ts`, code, 'utf-8')

