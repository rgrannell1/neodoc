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
    COMMAND:    'COMMAND'
  , POSITIONAL: 'POSITIONAL'
  , FLAG_SHORT: 'FLAG_SHORT'
  , FLAG_LONG:  'FLAG_LONG'
  , GROUP:      'GROUP'
};

/**
 * See if `parser` is succeeded by `...`
 * which indicates that the element is
 * ought to be repeated.
 */
var maybeRepeated = function(parser) {
    return parse.either(
        parse.attempt(
            lang.then(parser, text.string('...'))
                .map(function(x) {
                    return _.merge(x, {
                        modifiers: { repeating: true }
                    });
                })
        )
      , parser
            .map(function(x) {
                return _.merge(x, {
                    modifiers: { repeating: false }
                });
            })
    );
};

/**
 * Parse an argument potentially wrapped
 * as optional `[ ... ]` or required `( ... )`.
 *
 * @param {Parser} The parser to wrap.
 *
 * @return {Parser}
 */
var maybeOptional = function(parser) {
    return parse.either(
        lang.between(
            text.character('[')
          , text.character(']')
          , parser
        ).map(function(arg) {
            return _.merge(arg, {
                modifiers: { optional: true }
            });
        })
      , parser.map(function(arg) {
            return _.merge(arg, {
                modifiers: { optional: false }
            });
        })
    );
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
    text.character('<'), argname, text.character('>')));

/**
 * Parse a command
 */
var command = maybeRepeated(
    base.join(base.cons(
        text.match(/[a-z]/)
      , base.join(base.eager(text.match(/[a-z\-]/)))
    )).map(function(name) {
        return {
            type: OPT_TYPE.COMMAND
          , name: name
        };
    })
);

/**
 * Parse an argument, either:
 *
 * `ARGUMENT` or `<argument>`
 */
var _mkPositionalArg = function(parser) {
    return parser
        .map(function(arg) {
            return {
                type: OPT_TYPE.POSITIONAL
              , arg:  arg
            }
        })
};

var metaPositionalArg = maybeRepeated(_mkPositionalArg(
    parse.either(
        parse.attempt(_argname_)
      , parse.attempt(ARGNAME))));

/**
 * Parse a long option, either:
 *
 * `--option` or `--option=<arg>`
 */
var _mkLongOption = function(parser) {
    return base.cons(
        base.join(base.cons(text.string('--'), argname))
      , parse.optional(parse.choice(
            parse.attempt(parse.next(text.string('='), parser))
          , parse.attempt(parse.next(text.string(' '), parser))
        ))
    ).map(_.spread(function(name, arg) {
            return {
                type: OPT_TYPE.FLAG_LONG
              , name: name
              , arg:  arg
            };
        }
    ))
};

var metaLongOption = maybeRepeated(_mkLongOption(
    parse.either(
        parse.attempt(_argname_)
      , parse.attempt(ARGNAME))));

var longOption = _mkLongOption(
    parse.choice(
        parse.attempt(base.singleQuoted)
      , parse.attempt(base.doubleQuoted)
      , base.join(base.eager1(text.noneOf(' ')))));

/**
 * Parse a short unstacked option: `-f`
 */
var _mkShortOptionSingle = function(parser) {
    return base.cons(
        lang.then(
            base.join(base.cons(text.character('-'), text.letter))
          , parse.not(text.letter)
        )
      , parse.optional(parse.attempt(
            parse.next(text.string(' '), parser)))
    ).map(_.spread(function(name, arg) {
        return {
            type: OPT_TYPE.FLAG_SHORT
          , name: name
          , arg:  arg
        };
    }))
};

var metaShortOptionSingle = _mkShortOptionSingle(
    parse.either(
        parse.attempt(_argname_)
      , parse.attempt(ARGNAME)));

var shortOptionSingle = _mkShortOptionSingle(
    parse.choice(
        parse.attempt(base.singleQuoted)
      , parse.attempt(base.doubleQuoted)
      , base.join(base.eager1(text.noneOf(' ')))));

/**
 * Parse a short unstacked option, e.g.: `-fabc`
 */
var _mkShortOptionStacked = function(parser) {
    return base.cons(
        base.join(base.cons(
            text.character('-')
          , base.join(base.eager1(text.letter))))
      , parse.optional(parse.attempt(
            parse.next(text.string(' '), parser)
            ))
    ).map(_.spread(function(name, arg) {
        return {
            type: OPT_TYPE.FLAG_SHORT
          , name: name
          , arg:  arg
        };
    }))
};

var metaShortOptionStacked = _mkShortOptionStacked(
    parse.either(
        parse.attempt(_argname_)
      , parse.attempt(ARGNAME)));

var shortOptionStacked = _mkShortOptionStacked(
    parse.choice(
        parse.attempt(base.singleQuoted)
      , parse.attempt(base.doubleQuoted)
      , base.join(base.eager1(text.noneOf(' ')))));

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
var metaOption = parse.choice(
    parse.attempt(metaLongOption)
  , parse.attempt(metaShortOptionSingle)
  , parse.attempt(metaShortOptionStacked)
);

/**
 * Parse ambiguos matches:
 * Assume option w/o argument, resolve later:
 *     --output FILE -> [ --output, FILE ]
 *     -abc FILE     -> [ -abc,     FILE ]
 */
var metaOption = parse.choice(
    parse.attempt(metaLongOption)
  , parse.attempt(metaShortOptionSingle)
  , parse.attempt(metaShortOptionStacked)
);

var option = parse.choice(
    parse.attempt(longOption)
  , parse.attempt(shortOptionSingle)
  , parse.attempt(shortOptionStacked)
);

/**
 * Parse an argument, either positional
 * or not.
 */
var metaArgument = parse.choice(
    parse.attempt(command)
  , maybeOptional(parse.attempt(metaOption))
  , maybeOptional(parse.attempt(metaPositionalArg))
);

/**
 * Parse a group of `parser`s.
 * A group of `parser`s is seperated by a vertial bar `|`, i.e.:
 *
 * -h | --help
 */
var metaGroup = parse.rec(function(self) {
    return parse.eager(lang.sepBy(
        base.$(text.character('|'))
      , parse.eager(parse.many1(base.$(parse.choice(
            parse.attempt(metaArgument)
          , parse.attempt(lang.between(
                text.character('(')
              , text.character(')')
              , self
            ).map(function(xs) {
                return {
                    type:     OPT_TYPE.GROUP
                  , required: true
                  , nodes:    xs
                };
            }))
          , parse.attempt(lang.between(
                text.character('[')
              , text.character(']')
              , self
            ).map(function(xs) {
                return {
                    type:     OPT_TYPE.GROUP
                  , required: false
                  , nodes:    xs
                };
            }))
        ))))
    ))
});

module.exports.OPT_TYPE = OPT_TYPE;
module.exports.ARGNAME = ARGNAME;
module.exports._argname_ = _argname_;
module.exports.command = command;

module.exports.option = option;

module.exports.meta = {};
module.exports.meta.group = metaGroup;
module.exports.meta.option = metaOption;
module.exports.meta.argument = metaArgument;
module.exports.meta.longOption = metaLongOption;
module.exports.meta.positionalArg = metaPositionalArg;
module.exports.meta.shortOptionSingle = metaShortOptionSingle;
module.exports.meta.shortOptionStacked = metaShortOptionStacked;
