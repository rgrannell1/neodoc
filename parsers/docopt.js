'use strict';

var _ = require('lodash')
  , parse = require('bennu').parse
  , text = require('bennu').text
  , assert = require('assert')
  , args = require('../parsers/arguments')
;

/*
 * Given a single `usage` and a list of
 * `option` descriptions, infer a parser, that
 * when run against user intput will either
 * produce a valid program input for `usage`
 * or fail.
 *
 * @param {Usage}
 * A list of valid usages.
 *
 * @param {Option[]}
 * A list of option descriptions.
 *
 * @returns {Parser}
 */
var _generate = function(usage, options) {
    return parse.coicea(_.map(usage, function(group) {
    }));
};

/*
 * Given a list of `usages` and a list of
 * `option` descriptions, infer a parser, that
 * when run against user intput will either
 * produce a valid program input or fail.
 *
 * @param {Usage[]}
 * A list of valid usages.
 *
 * @param {Option[]}
 * A list of option descriptions.
 *
 * @returns {Parser}
 */
var generate = function(usages, options) {
    return parse.choicea(
        _.map(usages, function(usage) {
            return parse.attempt(_generate(usage, options));
        })
    );
};

module.exports.generate = generate;
