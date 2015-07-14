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
var longOption =
    base.cons(
        base.join(base.cons(text.string('--'), name))
      , parse.optional(parse.choice(
            parse.attempt(parse.next(text.string('='), argname))
                .map(function(arg) {
                    return {
                        name:     arg
                      , resolved: true
                    };
                })
          , parse.attempt(parse.next(text.string(' '), argname))
                .map(function(arg) {
                    return {
                        name:     arg
                      , resolved: false
                    };
                })
        ))
    ).map(_.spread(function(name, arg) {
            return {
                type:     nodes.TYPE.OPTION
              , name:     name
              , arg:      arg && arg.name
              , resolved: arg && arg.resolved
              , long:     true
            };
        }
    ));

/**
 * Parse a short unstacked option, i.e.:
 *     -f [<argument>]
 *     -f [<argument>]
 *     -f=ARGUMENT
 *     -f=<argument>
 */
var shortOptionSingle =
    base.cons(
        lang.then(
            base.join(base.cons(text.character('-'), text.letter))
          , parse.not(text.letter)
        )
      , parse.optional(parse.choice(
            parse.attempt(parse.next(text.string('='), argname))
          , parse.attempt(parse.next(text.string(' '), argname))))
    ).map(_.spread(function(name, arg) {
        return {
            type:     nodes.TYPE.OPTION
          , name:     name
          , arg:      arg
          , long:     false
          , stacked:  false
          , resolved: false
        };
    }));

/**
 * Parse a short unstacked option, i.e.:
 *     -fFILE [<argument>]
 *     -fFILE [ARGUMENT]
 */
var shortOptionStacked =
    base.cons(
        base.join(base.cons(
            text.character('-')
          , base.join(base.eager1(text.letter))))
      , parse.optional(parse.attempt(
            parse.next(text.string(' '), argname)
            ))
    ).map(_.spread(function(name, arg) {
        return {
            type:     nodes.TYPE.OPTION
          , name:     name
          , arg:      arg
          , long:     false
          , stacked:  true
          , resolved: false
        };
    }));

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
