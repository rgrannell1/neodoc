'use strict';

var _ = require('lodash')
  , parse = require('bennu').parse
  , lang = require('bennu').lang
  , text = require('bennu').text
  , base = require('../base')
;

/**
 * See if `parser` is succeeded by `...`
 * which indicates that the element is
 * ought to be repeated.
 */
var maybeRepeated = function(parser) {
    return parse.either(
        parse.attempt(
            lang.then(parser, base.$(text.string('...')))
                .map(function(x) {
                    return _.merge(x, {
                        modifiers: { repeating: true }
                    });
                })
        )
      , parser
            .map(function(x) {
                return _.merge(x, {
                    modifiers: { repeating: false }
                });
            })
    );
};

/**
 * Parse an argument potentially wrapped
 * as optional `[ ... ]` or required `( ... )`.
 *
 * @param {Parser} The parser to wrap.
 *
 * @return {Parser}
 */
var maybeOptional = function(parser) {
    return parse.either(
        lang.between(
            text.character('[')
          , text.character(']')
          , parser
        ).map(function(arg) {
            return _.merge(arg, {
                modifiers: { optional: true }
            });
        })
      , parser.map(function(arg) {
            return _.merge(arg, {
                modifiers: { optional: false }
            });
        })
    );
};

module.exports.maybeRepeated = maybeRepeated;
module.exports.maybeOptional = maybeOptional;
