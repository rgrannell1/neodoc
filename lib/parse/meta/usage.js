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
 * Parse a group of `parser`s.
 * A group of `parser`s is seperated by a vertial bar `|`, i.e.:
 *
 * -h | --help
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
                    type:     nodes.OPT_TYPE.GROUP
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
                    type:     nodes.OPT_TYPE.GROUP
                  , required: false
                  , nodes:    xs
                };
            })))
        ))))
    ));
});

var line = function(program) {
    return parse.next(
        text.string(program)
      , group
    );
};

module.exports.line = line;
module.exports.group = group;
