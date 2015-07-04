'use strict';

var _ = require('lodash')
  , parse = require('bennu').parse
  , text = require('bennu').text
  , lang = require('bennu').lang
  , base = require('../base')
  , modifiers = require('./modifiers')
  , argname = require('./argname')
  , nodes = require('../nodes')
;

/**
 * Parse an option name
 */
var name = base.join(base.cons(
    text.match(/[a-z]/)
  , base.join(base.eager(text.match(/[a-z\-]/)))));

/**
 * Parse the meta version of a long option, i.e. one of:
 *     --option
 *     --option=<arg>
 */
var longOption = modifiers.maybeRepeated(
    base.cons(
        base.join(base.cons(text.string('--'), name))
      , parse.optional(parse.choice(
            parse.attempt(parse.next(text.string('='), argname))
          , parse.attempt(parse.next(text.string(' '), argname))
        ))
    ).map(_.spread(function(name, arg) {
            return {
                type: nodes.OPT_TYPE.FLAG_LONG
              , name: name
              , arg:  arg
            };
        }
    ))
);

/**
 * Parse a short unstacked option, i.e.:
 *     -f [<argument>]
 *     -f [ARGUMENT]
 */
var shortOptionSingle = modifiers.maybeRepeated(
    base.cons(
        lang.then(
            base.join(base.cons(text.character('-'), text.letter))
          , parse.not(text.letter)
        )
      , parse.optional(parse.attempt(
            parse.next(text.string(' '), argname)))
    ).map(_.spread(function(name, arg) {
        return {
            type: nodes.OPT_TYPE.FLAG_SHORT
          , name: name
          , arg:  arg
        };
    }))
);

/**
 * Parse a short unstacked option, i.e.:
 *     -fFILE [<argument>]
 *     -fFILE [ARGUMENT]
 */
var shortOptionStacked = modifiers.maybeRepeated(
    base.cons(
        base.join(base.cons(
            text.character('-')
          , base.join(base.eager1(text.letter))))
      , parse.optional(parse.attempt(
            parse.next(text.string(' '), argname)
            ))
    ).map(_.spread(function(name, arg) {
        return {
            type: nodes.OPT_TYPE.FLAG_SHORT
          , name: name
          , arg:  arg
        };
    }))
);

/**
 * Parse a single option, i.e.:
 *     --output=<file>
 *     --some-feature
 *     -s
 *     -abc
 *
 * Parse ambiguos matches:
 * Assume option w/o argument, resolve later:
 *     --output FILE -> [ --output, FILE ]
 *     -abc FILE     -> [ -abc,     FILE ]
 */
var option = parse.choice(
    parse.attempt(longOption)
  , parse.attempt(shortOptionSingle)
  , parse.attempt(shortOptionStacked)
);

module.exports = option;
module.exports.name = name;
module.exports.long = longOption;
module.exports.short = shortOptionSingle;
module.exports.shortStacked = shortOptionStacked;
