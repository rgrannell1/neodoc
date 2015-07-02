'use strict';

var _ = require('lodash')
  , parse = require('bennu').parse
  , lang = require('bennu').lang
  , text = require('bennu').text
  , base = require('./base')
  , args = require('./arguments')
;

var TYPE = {
    REQUIRED: 'REQUIRED'
  , OPTIONAL: 'OPTIONAL'
};

var group = parse.rec(function(self) {
        return base.transform(
            lang.between(
                text.character(open)
              , text.character(close)
              , base.$(
                    parse.eager(
                        lang.sepBy1(
                            base.$(text.character('|'))
                          , parse.eager(parse.many1(base.$(
                                parse.choice(
                                    parse.attempt(self)
                                  , args.option
                                  , other
                                )
                            )))
                        )
                    )
                )
            )
          , function(elements) {
                return {
                    TYPE:    type
                  , elements: elements
                }
            }
        );
    });
};

var optional = group;
var required = group;

module.exports.TYPE = TYPE;
module.exports.required = required;
module.exports.optional = optional;
