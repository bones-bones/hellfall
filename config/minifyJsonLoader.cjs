'use strict';

/** Webpack loader: parse JSON and emit a compact module.exports (no pretty-print whitespace). */
module.exports = function minifyJsonLoader(source) {
  if (this.cacheable) this.cacheable();

  const value = typeof source === 'string' ? JSON.parse(source) : source;
  const minified = JSON.stringify(value)
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');

  return `module.exports = ${minified}`;
};
