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
 * @param {String} name
 * The name of the option to parse.
 *
 * @param {Boolean} argumentRequired
 * The returned parser requires the option to
 * be succeeded by an argument.
 *
 * @returns {Parser}
 */
var longOption = function(name, argumentRequired) {
    return base.cons(
        base.join(base.cons(text.string('--'), text.string(name)))
      , ((argumentRequired)
          ? parse.choice(
                parse.attempt(parse.next(text.string('='), argument.name))
              , parse.attempt(parse.next(text.string(' '), argument.name)))
          : parse.of(null))
    ).map(_.spread(function(name, arg) {
            return {
                type: nodes.TYPE.OPTION
              , name: name
              , arg:  arg
              , long: true
            };
        }
    ));
};

/**
 * Parse a short unstacked option
 *
 * @param {String} name
 * The name of the option to parse.
 *
 * @param {Boolean} argumentRequired
 * The returned parser requires the option to
 * be succeeded by an argument.
 *
 * @returns {Parser}
 */
var shortOptionSingle = function(name, argumentRequired) {
    return base.cons(
        lang.then(
            base.join(base.cons(text.character('-'), text.character(name)))
          , parse.not(text.letter)
        )
      , ((argumentRequired)
          ? parse.attempt(parse.next(text.string(' '), argument.name))
          : parse.of(null))
    ).map(_.spread(function(name, arg) {
        return {
            type:    nodes.TYPE.OPTION
          , name:    name
          , arg:     arg
          , long:    false
        };
    }));
};

/**
 * Parse an option.
 *
 * @param {String} name
 * The name of the option to parse.
 *
 * @param {Boolean} argumentRequired
 * Does this option require an argument?
 *
 * @returns {Parser}
 */
var option = function(name, argumentRequired) {
    return parse.choice(
        parse.attempt(longOption(name, argumentRequired))
      , parse.attempt(shortOptionSingle(name, argumentRequired))
    );
};

module.exports = option;
module.exports.long = longOption;
module.exports.short = shortOptionSingle;
