import typescript from 'rollup-plugin-typescript'
import babel from 'rollup-plugin-babel'
import tslint from 'rollup-plugin-tslint'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import json from 'rollup-plugin-json'

export default {
    input: 'src/sleet-drizzle.ts',
    plugins: [
        tslint({throwError: false}),
        typescript({
            include: 'src/**',
            exclude: 'node_modules/**',
            typescript: require('typescript')
        }),
        {
            resolveId(a, b) {
                console.log(a, b)
            }
        },
        resolve(),
        commonjs({
            include: ['node_modules/**']
        }),
        json(),
        babel({
            babelrc: false,
            exclude: 'node_modules/**',
            presets: ['es2015-rollup']
        })
    ],

    output: {
        file: 'dist/sleet-drizzle.js',
        format: 'umd',
        name: 'sleet-drizzle',
        sourcemap: true
    }
}
