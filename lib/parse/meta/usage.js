'use strict';

var _ = require('lodash')
  , parse = require('bennu').parse
  , lang = require('bennu').lang
  , text = require('bennu').text
  , base = require('../base')
  , argument = require('./argument')
  , modifiers = require('./modifiers')
  , nodes = require('../nodes')
;

/**
 * Parse arguments separated by 0 or more vertical bars.
 * Each vertical bar `|` denotes a mutually exclusive set
 * of options on each side.
 *
 * The top-level list of arguments specified in a `usage`
 * line is  nothing further than another group itself, but
 * lacking the surrounding brackets or parenthesis.
 */
var group = parse.rec(function(self) {
    return parse.eager(lang.sepBy(
        base.$(text.character('|'))
      , parse.eager(parse.many1(base.$(parse.choice(
            parse.attempt(argument)
          , modifiers.maybeRepeated(parse.attempt(lang.between(
                text.character('(')
              , text.character(')')
              , self
            ).map(function(xs) {
                return {
                    type:     nodes.TYPE.GROUP
                  , required: true
                  , nodes:    xs
                };
            })))
          , modifiers.maybeRepeated(parse.attempt(lang.between(
                text.character('[')
              , text.character(']')
              , self
            ).map(function(xs) {
                return {
                    type:     nodes.TYPE.GROUP
                  , required: false
                  , nodes:    xs
                };
            })))
        ))))
    ));
});

/**
 * Parse a single usage line.
 */
var line = function(program) {
    return parse.next(
        text.string(program)
      , group
    );
};

module.exports.line = line;
module.exports.group = group;
