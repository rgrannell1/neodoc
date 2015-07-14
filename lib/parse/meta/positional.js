'use strict';

var modifiers = require('./modifiers')
  , nodes = require('../nodes')
  , argname = require('./argname')
;

/**
 * Parse a positional argument, i.e. one of:
 *    ARGUMENT
 *    <argument>
 */
var positional = argname
    .map(function(arg) {
        return {
            type: nodes.TYPE.POSITIONAL
          , arg:  arg
          , name: arg
        };
    });

module.exports = positional;
