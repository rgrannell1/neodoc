'use strict';

var text = require('bennu').text
  , base = require('../base')
  , modifiers = require('./modifiers')
  , nodes = require('../nodes')
;

/**
 * Parse a command, i.e. one of:
 *    command
 *    command ...
 */
var command = modifiers.maybeRepeated(
    base.join(base.cons(
        text.match(/[a-z]/)
      , base.join(base.eager(text.match(/[a-z\-]/)))
    )).map(function(name) {
        return {
            type: nodes.TYPE.COMMAND
          , name: name
        };
    })
);

module.exports = command;
