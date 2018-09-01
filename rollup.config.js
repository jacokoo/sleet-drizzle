import typescript from 'rollup-plugin-typescript'
import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import json from 'rollup-plugin-json'
import { uglify } from 'rollup-plugin-uglify'

export default {
    input: 'src/index.ts',
    external: ['sleet'],
    plugins: [
        typescript({
            include: 'src/**',
            exclude: 'node_modules/**',
            typescript: require('typescript')
        }),
        resolve(),
        commonjs({
            include: ['node_modules/**'],
        }),
        json(),
        babel({
            babelrc: false,
            exclude: 'node_modules/**',
            presets: ['es2015-rollup']
        }),
        uglify()
    ],

    output: {
        file: 'dist/sleet-drizzle.min.js',
        format: 'umd',
        name: 'SleetDrizzle',
        sourcemap: true,
        globals: {
            sleet: 'Sleet'
        }
    }
}
