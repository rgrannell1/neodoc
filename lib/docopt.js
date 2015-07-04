'use strict';

var _ = require('lodash')
  , parse = require('bennu').parse
  , text = require('bennu').text
  , assert = require('assert')
  , base = require('./parse/base')
  , meta = require('./parse/meta')
  , input = require('./parse/input')
  , nodes = require('./parse/nodes')
;

var nodeIsRequired = function(node) {
    return (node.type === nodes.TYPE.COMMAND
        || (node.modifiers && node.modifiers.optional === false)
    );
};

/**
 * Generate a parser for a single group.
 *
 * The parser is expected to be run against a expanded/resolved
 * user input, i.e. there should be no stacked options.
 *
 * XXX: Implement user input expansion mechanism.
 *
 * @param {Group} group
 * The `GROUP` node to generate a parser for.
 *
 * The group is initially compromised as follows:
 * GROUP := POS | COMMAND | OPT | GROUP
 *
 * In order to parse `0..n` options for `OPT`, the input
 * group accumulates all adjacent `OPTION` values:
 *
 * GROUP := POS | COMMAND | OPT[] | GROUP
 *
 * `POS` and `OPT[]` and `GROUP` parsers MUST parse, unless
 * they are flagged as optional. However, a failed `OPT[]` parse
 * is the same as the empty `OPT[]` parse, hence optional in
 * nature.
 *
 * XXX: Can `COMMAND` be optional?
 *
 * @param {Options} options
 * The options block to resolve ambiguities.
 *
 * @returns {Parser}
 */
var _generateGroup = function(group, options) {
    return _.foldl(_.map(
        group, function(node) {
            return {
                node: node
              , parser: (
                    (node.type === nodes.TYPE.COMMAND)
                      ? text.string(node.name)
                  : (node.type === nodes.TYPE.POSITIONAL)
                      ? input.argument.positional
                  : (node.type === nodes.TYPE.OPTION)
                      ? input.argument.option(node.name, (!!node.arg))
                  : parse.fail('Unknown Type: `' + node.type + '`'))
             };
        })
      , function(acc, node) {
            return acc.chain(_.constant(base.$(node.parser)));
        }
      , parse.of({})
    )
      // , function(segment) {
      //       return base.$(segment.parser).map(function(output) {
      //           return {
      //               input:  segment.node
      //             , output: output
      //           };
      //       });
      //   }
    // ));
};
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
var _generateUsage = function(usage, options) {
    return parse.choicea(
        _.map(usage, function(group) {
            return parse.attempt(_generateGroup(group));
        })
    );
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
    // console.log('usages', usages);
    return parse.choicea(
        _.map(usages, function(usage) {
            // console.log('usage', usage);
            return parse.attempt(_generateUsage(usage, options));
        })
    );
};

module.exports.generate = generate;
