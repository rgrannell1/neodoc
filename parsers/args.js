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
var ARG_TYPE = {
    FLAG:     'FLAG'
  , POSITION: 'POSITION'
  , OPTION:   'OPTION'
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

/**
 * Parse a single option, i.e.:
 *     --output=<arg>
 *     --some-flag
 *     -s
 *     -abc
 */
var option = lang.then(parse.choice(
    parse.attempt(
        base.transform(
            base.cons(
                parse.next(
                    text.string('--')
                  , argname
                )
              , parse.next(
                    text.string('=')
                  , _argname_
                )
            )
          , _.spread(function(name, val) {
                return {
                    type: ARG_TYPE.OPTION
                  , name: name
                  , val:  val
                };
            })
        )
    )
  , parse.attempt(
        base.transform(
            parse.next(
                text.string('--')
              , argname
            )
          , function(name) {
                return {
                    type: ARG_TYPE.FLAG
                  , name: name
                }
          }
        )
    )
), parse.many(text.space));


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

module.exports.ARG_TYPE = ARG_TYPE;
module.exports.ARGNAME = ARGNAME;
module.exports.argname = argname;
module.exports._argname_ = _argname_;
module.exports.positionalArg = positionalArg;
module.exports.option = option;
module.exports.maybeOptionalArg = maybeOptionalArg;
module.exports.argument = argument;
