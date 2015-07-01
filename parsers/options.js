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
        parse.many(base.space)
      , base.join(base.eager1(text.noneOf(']')))
    )
);

var option = lang.then(
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
  , parse.sequence(
        base.space
      , base.space
      , parse.many(base.space)
    )
)
;

module.exports.defaults = defaults;
module.exports.option = option;
