'use strict';

var argname = require('./argname')
  , nodes = require('../nodes')
;

/**
 * Parse an argument, either:
 *
 * `ARGUMENT` or `<argument>`
 */
var positional = argname;

module.exports = positional;
