'use strict';

var parse = require('bennu').parse
  , text = require('bennu').text
  , base = require('../base')
;

var argument =
    parse.choice(
        parse.attempt(base.singleQuoted)
      , parse.attempt(base.doubleQuoted)
      , text.noneOf(' -').chain(function(x) {
            return base.eager(text.noneOf(' '))
                .map(function(xs) {
                    return [ x ].concat(xs).join('');
                });
        })
    );

module.exports = argument;
