'use strict';

var parse = require('bennu').parse
  , text = require('bennu').text
  , base = require('../base')
;

var argument =
    parse.choice(
        parse.attempt(base.singleQuoted)
      , parse.attempt(base.doubleQuoted)
      , base.join(base.eager1(text.noneOf(' '))));

module.exports = argument;
