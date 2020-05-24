import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'index.js',
  output: {
    file: 'dist/elemx.umd.js',
    format: 'iife',
    name: 'elemx'
  },
  plugins: [
    resolve(),
    commonjs()
  ]
}
