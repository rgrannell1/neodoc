'use strict';

var argname = require('./argname')
  , nodes = require('../nodes')
;

/**
 * Parse an argument, either:
 *
 * `ARGUMENT` or `<argument>`
 */
var positional = argname
    .map(function(arg) {
        return {
            type: nodes.TYPE.POSITIONAL
          , arg:  arg
        };
    });

module.exports = positional;
