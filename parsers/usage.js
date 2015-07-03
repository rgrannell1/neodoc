'use strict';

var _ = require('lodash')
  , parse = require('bennu').parse
  , text = require('bennu').text
  , assert = require('assert')
  , base = require('./base')
  , args = require('./arguments')
  , structs = require('./structures')
;

var line = function(program) {
    return parse.next(
        text.string(program)
      , parse.eager(parse.many(
            parse.next(
                parse.many(base.space)
              , parse.either(
                    parse.attempt(args.argument)
                  , structs.group
                )
            )
        ))
    )
};

module.exports.line = line;
