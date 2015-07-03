'use strict';

var _ = require('lodash')
  , parse = require('bennu').parse
  , text = require('bennu').text
  , base = require('./base')
  , args = require('./arguments')
;

var line = function(program) {
    return parse.next(
        text.string(program)
      , parse.eager(parse.many(
            parse.next(
                parse.many(base.space)
              , args.argument
            )
        ))
    );
};

module.exports.line = line;
