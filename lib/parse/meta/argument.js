'use strict';

var parse = require('bennu').parse
  , command = require('./command')
  , option = require('./option')
  , positional = require('./positional')
  , modifiers = require('./modifiers')
  , argname = require('./argname')
;

/**
 * Parse an argument, either positional
 * or not.
 */
var argument = parse.choice(
    parse.attempt(command)
  , modifiers.maybeOptional(parse.attempt(option))
  , modifiers.maybeOptional(parse.attempt(positional))
);

module.exports = argument;
module.exports.option = option;
module.exports.positional = positional;
module.exports.ARGNAME = argname.ARGNAME;
module.exports._argname_ = argname._argname_;
