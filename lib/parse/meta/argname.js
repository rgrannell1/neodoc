'use strict';

var text = require('bennu').text
  , parse = require('bennu').parse
  , base = require('../base')
;

/**
 * Parse an ARGUMENT name
 */
var ARGNAME = base.join(base.cons(
    text.match(/[A-Z]/)
  , base.join(base.eager(text.match(/[A-Z\-]/)))));

/**
 * Parse an <argument>
 */
var _argname_ = base.join(base.cons(
    text.character('<')
  , base.join(base.cons(
        text.match(/[a-z]/)
      , base.join(base.eager(text.match(/[a-z\-]/)))))
  , text.character('>')));

var either = parse.either(
    parse.attempt(_argname_)
  , parse.attempt(ARGNAME));

module.exports = either;
module.exports.ARGNAME = ARGNAME;
module.exports._argname_ = _argname_;
