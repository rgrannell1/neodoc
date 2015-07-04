'use strict';

var _ = require('lodash')
  , parse = require('bennu').parse
  , lang = require('bennu').lang
  , text = require('bennu').text
  , base = require('../base')
  , nodes = require('../nodes')
  , argument = require('./argument')
  , meta = require('../meta')
;

/**
 * Parse a long option.
 *
 * @param {Boolean} argumentRequired
 * The returned parser requires the option to
 * be succeeded by an argument.
 *
 * @returns {Parser}
 */
var longOption = function(argumentRequired) {
    return base.cons(
        base.join(base.cons(text.string('--'), meta.argument.option.name))
      , ((argumentRequired)
          ? parse.choice(
                parse.attempt(parse.next(text.string('='), argument.name))
              , parse.attempt(parse.next(text.string(' '), argument.name)))
          : parse.of(null))
    ).map(_.spread(function(name, arg) {
            return {
                type: nodes.TYPE.FLAG_LONG
              , name: name
              , arg:  arg
            };
        }
    ));
};

/**
 * Parse a short unstacked option
 *
 * @param {Boolean} argumentRequired
 * The returned parser requires the option to
 * be succeeded by an argument.
 *
 * @returns {Parser}
 */
var shortOptionSingle = function(argumentRequired) {
    return base.cons(
        lang.then(
            base.join(base.cons(text.character('-'), text.letter))
          , parse.not(text.letter)
        )
      , ((argumentRequired)
          ? parse.attempt(parse.next(text.string(' '), argument.name))
          : parse.of(null))
    ).map(_.spread(function(name, arg) {
        return {
            type: nodes.TYPE.FLAG_SHORT
          , name: name
          , arg:  arg
        };
    }));
};

/**
 * Parse a short stacked option
 *
 * @param {Boolean} argumentRequired
 * The returned parser requires the option to
 * be succeeded by an argument.
 *
 * @returns {Parser}
 */
var shortOptionStacked = function(argumentRequired) {
    return base.cons(
        base.join(base.cons(
            text.character('-')
          , base.join(base.eager1(text.letter))))
      , ((argumentRequired)
          ? parse.attempt(parse.next(text.string(' '), argument.name))
          : parse.of(null))
    ).map(_.spread(function(name, arg) {
        return {
            type: nodes.TYPE.FLAG_SHORT
          , name: name
          , arg:  arg
        };
    }));
};

/**
 * Parse an option.
 *
 * @param {Boolean} argumentRequired
 * Does this option require an argument?
 *
 * @returns {Parser}
 */
var option = function(argumentRequired) {
    return parse.choice(
        parse.attempt(longOption(argumentRequired))
      , parse.attempt(shortOptionSingle(argumentRequired))
      , parse.attempt(shortOptionStacked(argumentRequired))
    );
};


module.exports = option;
module.exports.long = longOption;
module.exports.short = shortOptionSingle;
module.exports.shortStacked = shortOptionStacked;
