import { readFileSync, writeFileSync } from 'node:fs'
import * as esbuild from 'esbuild'

await esbuild.build({
  entryPoints: ['src/client/index.tsx'],
  bundle: true,
  format: 'cjs',
  platform: 'browser',
  target: 'es2022',
  outfile: 'dist/client/bundle.js',
  external: ['react', 'react-dom', 'react/jsx-runtime', 'react/jsx-dev-runtime'],
  jsx: 'automatic',
  legalComments: 'none',
})

const body = readFileSync('dist/client/bundle.js', 'utf8')
const wrapped = `window.__ModuleLoader__.load({
  id: "dsh-hr-plugin",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
${body}
    return module.exports;
  }
});
`
writeFileSync('dist/client/bundle.js', wrapped)
