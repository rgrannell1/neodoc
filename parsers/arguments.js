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
  , MUTEX:      'MUTEX' // XXX: Remove
};

/**
 * Argument modifiers.
 * @enum
 * @readonly
 */
var MOD_TYPE = {
    OPTIONAL:  'OPTIONAL'
  , REQUIRED:  'REQUIRED'
  , REPEATING: 'REPEATING'
}

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
 * 
 */

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
        base.transform(
            lang.between(
                text.character('[')
              , text.character(']')
              , parser
            )
          , function(arg) {
                return _.merge(arg, {
                    modifiers: { optional: true }
                });
            }
        )
      , base.transform(
            parser
          , function(arg) {
                return _.merge(arg, {
                    modifiers: { optional: false }
                });
            }
        )
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
    base.transform(
        base.join(base.cons(
            text.match(/[a-z]/)
          , base.join(base.eager(text.match(/[a-z\-]/)))
        ))
      , function(name) {
            return {
                type: OPT_TYPE.COMMAND
              , name: name
            };
        }
    )
);

/**
 * Parse an argument, either:
 *
 * `ARGUMENT` or `<argument>`
 */
var positionalArg = maybeRepeated(
    parse.either(ARGNAME, _argname_)
        .map(function(name) {
            return {
                type: OPT_TYPE.POSITIONAL
              , name: name
            }
        })
);

/**
 * Parse a long option, either:
 *
 * `--option` or `--option=<arg>`
 */
var longOption = maybeRepeated(
    base.transform(
        base.cons(
            base.join(base.cons(text.string('--'), argname))
          , parse.optional(parse.choice(
                parse.attempt(parse.next(text.string('=')
                  , parse.either(
                        parse.attempt(_argname_)
                      , parse.attempt(ARGNAME))))
              , parse.attempt(parse.next(text.string(' ')
                  , parse.either(
                        parse.attempt(_argname_)
                      , parse.attempt(ARGNAME))))
            ))
        )
      , _.spread(function(name, arg) {
            return {
                type: OPT_TYPE.FLAG_LONG
              , name: name
              , arg:  arg
            };
        })
    ));

/**
 * Parse a short unstacked option: `-f`
 */
var shortOptionSingle =
    base.transform(
        base.cons(
            lang.then(
                base.join(base.cons(text.character('-'), text.letter))
              , parse.not(text.letter)
            )
          , parse.optional(parse.attempt(
                parse.next(text.string(' '), parse.either(
                    parse.attempt(_argname_)
                  , parse.attempt(ARGNAME)))))
        )
      , _.spread(function(name, arg) {
            return {
                type: OPT_TYPE.FLAG_SHORT
              , name: name
              , arg:  arg
            };
        })
    );

/**
 * Parse a short unstacked option, e.g.: `-fabc`
 */
var shortOptionStacked =
    base.transform(
        base.cons(
            base.join(base.cons(
                text.character('-')
              , base.join(base.eager1(text.letter))))
          , parse.optional(parse.attempt(
                parse.next(text.string(' '), parse.either(
                    parse.attempt(_argname_)
                  , parse.attempt(ARGNAME)
                ))))
        )
      , _.spread(function(name, arg) {
            return {
                type: OPT_TYPE.FLAG_SHORT
              , name: name
              , arg:  arg
            };
        })
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

/**
 * Parse an argument, either positional
 * or not.
 */
var argument = parse.choice(
    parse.attempt(command)
  , maybeOptional(parse.attempt(option))
  , maybeOptional(parse.attempt(positionalArg))
);

/**
 * Parse a group of arguments.
 * A group of arguments is seperated by a vertial bar `|`, i.e.:
 *
 * -h | --help
 * 
 */
var group = parse.rec(function(self) {
    return parse.eager(lang.sepBy(
        base.$(text.character('|'))
      , parse.eager(parse.many1(base.$(parse.choice(
            parse.attempt(argument)
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
module.exports.argname = argname;
module.exports.command = command;
module.exports._argname_ = _argname_;
module.exports.positionalArg = positionalArg;
module.exports.option = option;
module.exports.maybeOptional = maybeOptional;
module.exports.argument = argument;
module.exports.longOption = longOption;
module.exports.shortOptionStacked = shortOptionStacked;
module.exports.shortOptionSingle = shortOptionSingle;
module.exports.group = group;
