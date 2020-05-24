import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'index.js',
  output: {
    file: 'dist/elemx.umd.js',
    format: 'umd',
    name: 'elemx'
  },
  plugins: [
    resolve(),
  ]
}
