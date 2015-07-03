'use strict';

var _ = require('lodash')
  , parse = require('bennu').parse
  , lang = require('bennu').lang
  , text = require('bennu').text
  , base = require('./base')
  , args = require('./arguments')
;

var group = parse.rec(function(self) {
        return base.transform(
            lang.between(
                text.character('(')
              , text.character(')')
              , base.$(
                    parse.eager(
                        lang.sepBy1(
                            base.$(text.character('|'))
                          , parse.eager(parse.many1(base.$(
                                parse.choice(
                                    parse.attempt(self)
                                  , args.argument
                                )
                            )))
                        )
                    )
                )
            )
          , function(args) {
                return {
                    TYPE: 'MUTEX'
                  , args: args
                }
            }
        );
    });

module.exports.group = group;
