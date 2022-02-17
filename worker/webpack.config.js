import { dirname, join } from 'path'
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default {
  entry: './src/index.ts',
  output: {
    filename: 'worker.js',
    path: join(__dirname, 'dist'),
  },
  devtool: 'cheap-module-source-map',
  mode: 'production',
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
      },
    ],
  },
};
