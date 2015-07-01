'use strict';

var _ = require('lodash')
  , parse = require('bennu').parse
  , lang = require('bennu').lang
  , text = require('bennu').text
  , base = require('./base')
  , args = require('./args')
;

var defaults = lang.between(
    text.string('[default:')
  , text.character(']')
  , parse.sequence(
        parse.many1(base.space)
      , parse.eager(lang.sepBy1(
            parse.many1(base.space)
          , parse.choice(
                parse.attempt(base.doubleQuoted)
              , parse.attempt(base.singleQuoted)
              , base.join(base.eager1(text.noneOf('] ')))
            )
        ))
    )
);

var option = base.transform(base.cons(
    base.transform(
        parse.choice(
            parse.attempt(base.cons(
                args.shortOptionSingle
              , parse.optional(
                    parse.next(
                        text.string(', ')
                      , args.longOption
                    )
                )
            ))
          , parse.attempt(args.shortOptionSingle)
          , parse.attempt(args.longOption)
        )
      , function(x) { return _.isArray(x) ? x : [ x ]; }
    )
  , parse.sequence(
        base.space
      , base.space
      , base.transform(
            base.cons(
                base.join(parse.eager(parse.manyTill(
                    parse.anyToken
                  , parse.choice(
                        text.match(/\n/)
                      , defaults
                    )
                )))
              , parse.optional([], defaults)
            )
          , _.spread(function(description, defaults) {
                return {
                    description: description
                  , defaults:    defaults
                };
            })
        )
    ))
  , _.spread(function(flags, text) {
        return {
            flags:       flags
          , defaults:    text.defaults
          , description: text.description
        };
  })
);

module.exports.defaults = defaults;
module.exports.option = option;
