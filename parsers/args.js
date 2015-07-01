'use strict';

var _ = require('lodash')
  , parse = require('bennu').parse
  , lang = require('bennu').lang
  , text = require('bennu').text
  , base = require('./base')
;

/**
 * Argument types.
 * @enum
 * @readonly
 */
var OPT_TYPE = {
    SHORT: 'FLAG'
  , LONG:  'LONG'
};

/**
 * Parse an ARGUMENT name
 */
var ARGNAME = base.join(base.cons(
    text.match(/[A-Z]/)
  , base.join(base.eager(text.match(/[A-Z\-]/)))));

/**
 * Parse an argument
 */
var argname = base.join(base.cons(
    text.match(/[a-z]/)
  , base.join(base.eager(text.match(/[a-z\-]/)))));

/**
 * Parse an <argument>
 */
var _argname_ = base.join(base.cons(
    text.character('<')
  , argname
  , text.character('>')
));

/**
 * Parses an argument, either:
 *
 * `ARGUMENT` or `<argument>`
 */
var positionalArg = parse.either(ARGNAME, _argname_);

var longOption =
        base.transform(
            base.cons(
                parse.next(text.string('--'), argname)
              , parse.optional(null, parse.next(text.string('='), _argname_))
            )
          , _.spread(function(name, arg) {
                return {
                    type: OPT_TYPE.LONG
                  , name: name
                  , arg:  arg
                };
            })
        );

var shortOptionSingle =
    base.transform(
        lang.then(
            parse.next(text.character('-'), text.letter)
          , parse.not(text.letter)
        )
      , function(name) {
            return {
                type: OPT_TYPE.SHORT
              , name: name
            };
        }
    );

var shortOptionStacked =
    base.transform(
        parse.next(
            text.character('-')
          , base.join(base.cons(base.eager1(text.letter))))
      , function(name) {
            return {
                type: OPT_TYPE.SHORT
              , name: name
            };
        }
    );

/**
 * Parse a single option, i.e.:
 *     --output=<file>, --some-feature
 *     -s, -abc
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


var maybeOptionalArg = function(parser) {
    return parse.either(
        base.transform(
            lang.between(
                text.character('[')
              , text.character(']')
              , parser
            )
          , function(name) { return { arg: name, optional: true } }
        )
      , base.transform(
            parser
          , function(name) { return { arg: name, optional: false } }
        )
    )
};

var argument = parse.choice(
    maybeOptionalArg(parse.attempt(option))
  , maybeOptionalArg(parse.attempt(positionalArg))
);

module.exports.OPT_TYPE = OPT_TYPE;
module.exports.ARGNAME = ARGNAME;
module.exports.argname = argname;
module.exports._argname_ = _argname_;
module.exports.positionalArg = positionalArg;
module.exports.option = option;
module.exports.maybeOptionalArg = maybeOptionalArg;
module.exports.argument = argument;
module.exports.longOption = longOption;
module.exports.shortOptionStacked = shortOptionStacked;
module.exports.shortOptionSingle = shortOptionSingle;
