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
            lang.then(parser, base.$(text.string('...')))
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

var positionalArg = _mkPositionalArg(
    parse.choice(
        parse.attempt(base.singleQuoted)
      , parse.attempt(base.doubleQuoted)
      , base.join(base.eager1(text.noneOf(' ')))));

/**
 * An argument to the meta option, i.e. one of:
 *     ARGUMENT
 *     <argument>
 */
var _metaOptArg =
    parse.either(
        parse.attempt(_argname_)
      , parse.attempt(ARGNAME));

/**
 * Parse the meta version of a long option, i.e. one of:
 *     --option
 *     --option=<arg>
 */
var metaLongOption = maybeRepeated(
    base.cons(
        base.join(base.cons(text.string('--'), argname))
      , parse.optional(parse.choice(
            parse.attempt(parse.next(text.string('='), _metaOptArg))
          , parse.attempt(parse.next(text.string(' '), _metaOptArg))
        ))
    ).map(_.spread(function(name, arg) {
            return {
                type: OPT_TYPE.FLAG_LONG
              , name: name
              , arg:  arg
            };
        }
    )));

/**
 * An argument to the option. Can by any
 * string without spaces or quoted string.
 */
var _optArg =
    parse.choice(
        parse.attempt(base.singleQuoted)
      , parse.attempt(base.doubleQuoted)
      , base.join(base.eager1(text.noneOf(' '))));

/**
 * Parse a long option.
 *
 * @param {Boolean} argumentRequired
 * The returned parser requires the option to
 * be succeeded by an argument.
 *
 * @returns {Parser}
 */
var longOption = function(argumentRequired) {
    return base.cons(
        base.join(base.cons(text.string('--'), argname))
            .map(function(x){
                console.log('herex');
                return x;
            })
      , ((argumentRequired)
          ? parse.choice(
                parse.attempt(parse.next(text.string('='), _optArg))
              , parse.attempt(parse.next(text.string(' '), _optArg)))
          : parse.of(null))
    ).map(_.spread(function(name, arg) {
            return {
                type: OPT_TYPE.FLAG_LONG
              , name: name
              , arg:  arg
            };
        }
    ));
};

/**
 * Parse a short unstacked option, i.e.:
 *     -f [<argument>]
 *     -f [ARGUMENT]
 */
var metaShortOptionSingle = maybeRepeated(
    base.cons(
        lang.then(
            base.join(base.cons(text.character('-'), text.letter))
          , parse.not(text.letter)
        )
      , parse.optional(parse.attempt(
            parse.next(text.string(' '), _metaOptArg)))
    ).map(_.spread(function(name, arg) {
        return {
            type: OPT_TYPE.FLAG_SHORT
          , name: name
          , arg:  arg
        };
    })));

/**
 * Parse a short unstacked option
 *
 * @param {Boolean} argumentRequired
 * The returned parser requires the option to
 * be succeeded by an argument.
 *
 */
var shortOptionSingle = function(argumentRequired) {
    return base.cons(
        lang.then(
            base.join(base.cons(text.character('-'), text.letter))
          , parse.not(text.letter)
        )
      , ((argumentRequired)
          ? parse.attempt(parse.next(text.string(' '), _optArg))
          : parse.of(null))
    ).map(_.spread(function(name, arg) {
        return {
            type: OPT_TYPE.FLAG_SHORT
          , name: name
          , arg:  arg
        };
    }));
};

/**
 * Parse a short unstacked option, i.e.:
 *     -fFILE [<argument>]
 *     -fFILE [ARGUMENT]
 */
var metaShortOptionStacked = maybeRepeated(
    base.cons(
        base.join(base.cons(
            text.character('-')
          , base.join(base.eager1(text.letter))))
      , parse.optional(parse.attempt(
            parse.next(text.string(' '), _metaOptArg)
            ))
    ).map(_.spread(function(name, arg) {
        return {
            type: OPT_TYPE.FLAG_SHORT
          , name: name
          , arg:  arg
        };
    })));

var shortOptionStacked = function(argumentRequired) {
    return base.cons(
        base.join(base.cons(
            text.character('-')
          , base.join(base.eager1(text.letter))))
      , ((argumentRequired)
          ? parse.attempt(parse.next(text.string(' '), _optArg))
          : parse.of(null))
    ).map(_.spread(function(name, arg) {
        return {
            type: OPT_TYPE.FLAG_SHORT
          , name: name
          , arg:  arg
        };
    }))
};

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
 * Parse a meta option.
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
 * Parse an option.
 *
 * @param {Boolean} argumentRequired
 * Does this option require an argument?
 *
 * @returns {Parser}
 */
var option = function(argumentRequired) {
    return parse.choice(
        parse.attempt(longOption(argumentRequired))
      , parse.attempt(shortOptionSingle(argumentRequired))
      , parse.attempt(shortOptionStacked(argumentRequired))
    );
};

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
          , maybeRepeated(parse.attempt(lang.between(
                text.character('(')
              , text.character(')')
              , self
            ).map(function(xs) {
                return {
                    type:     OPT_TYPE.GROUP
                  , required: true
                  , nodes:    xs
                };
            })))
          , maybeRepeated(parse.attempt(lang.between(
                text.character('[')
              , text.character(']')
              , self
            ).map(function(xs) {
                return {
                    type:     OPT_TYPE.GROUP
                  , required: false
                  , nodes:    xs
                };
            })))
        ))))
    ))
});

module.exports.option = option;
module.exports.command = command;
module.exports.ARGNAME = ARGNAME;
module.exports.OPT_TYPE = OPT_TYPE;
module.exports._argname_ = _argname_;
module.exports.positional = positionalArg;

module.exports.meta = {};
module.exports.meta.group = metaGroup;
module.exports.meta.option = metaOption;
module.exports.meta.argument = metaArgument;
module.exports.meta.longOption = metaLongOption;
module.exports.meta.positionalArg = metaPositionalArg;
module.exports.meta.shortOptionSingle = metaShortOptionSingle;
module.exports.meta.shortOptionStacked = metaShortOptionStacked;
