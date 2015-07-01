'use strict';

var _ = require('lodash')
  , parse = require('bennu').parse
  , lang = require('bennu').lang
  , text = require('bennu').text
  , base = require('./base')
  , args = require('./args')
;

var TYPE = {
    GROUP: 'GROUP'
};

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
                            parse.either(
                                parse.attempt(self)
                              , args.option
                            )
                        )))
                    )
                  , function(subnodes) {
                        return {
                            TYPE: 'SUBGROUP'
                          , nodes: subnodes
                        };
                    }
                )
            )
        )
      , function(children) {
            return {
                TYPE:    'GROUP'
              , children: children
            }
        }
    )
});

module.exports.TYPE = TYPE;
module.exports.group = group;
