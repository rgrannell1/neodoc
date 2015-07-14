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

var _generators = {};

/**
 * Generate a parser for a `command` node.
 *
 * @param {Node.<Command>} node
 * The node to generate a parser for
 *
 * @returns {Parser}
 */
_generators[nodes.TYPE.COMMAND] = function(node) {
    return text.string(node.name);
};

/**
 * Generate a parser for a `positional argument` node.
 *
 * @param {Node.<Positional>} node
 * The node to generate a parser for
 *
 * @returns {Parser}
 */
_generators[nodes.TYPE.POSITIONAL] = function(node) {
    return ((node.modifiers.optional === true)
      ? parse.attempt
      : _.identity)(input.argument.positional);
};

/**
 * Generate a parser for a `option argument` node.
 *
 * @param {Node.<Optiona>} node
 * The node to generate a parser for
 *
 * @returns {Parser}
 */
_generators[nodes.TYPE.OPTION] = function(node) {
    return parse.attempt(input.argument.option(
        node.name, (!!node.arg)
    ));
};

/**
 * Generate a parser for a `group` node.
 *
 * ( --foo --bar | --qux )
 * ^^^^^^^^^^^^^^^^^^^^^^^
 *
 * or:
 *
 * [ --foo --bar | --qux ]
 * ^^^^^^^^^^^^^^^^^^^^^^^
 *
 * @param {Node.<Group>} node
 * The node to generate a parser for
 *
 * @returns {Parser}
 */
_generators[nodes.TYPE.GROUP] = function(node) {
    return parse.choicea(_.map(node.nodes, _generateEither));
};

var _generateNode = function(node) {
    return _generators[node.type](node);
};

/**
 * Generate a parser for a single either grouping.
 *
 * ( --foo --bar | --qux )
 *   ^^^^^^^^^^^
 *
 * @param {Node[]} either
 * @returns {Parser} parser
 */
var _generateEither = function(either) {
    return base.cons.apply(null, _.map(
        either
      , _.flow(_generateNode, base.$)
    ));
};

/**
 * Generate a parser for a single use case.
 *
 * naval_fate ship <name> move <x> <y> [--speed=<kn>]
 * ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 * naval_fate steer <x> <y> [--speed=<kn>]
 *
 * @param {UseCase} usecase
 * @returns {Parser} parser
 */
var _generateUsagecase = function(usecase) {
    return parse.either(parse.choicea(_.map(
        usecase
      , _.flow(_generateEither, base.$)
    ), parse.eof));
};

/**
 * Generate a parser for a complete usage spec.
 */
function generate(usage, options) {
    return parse.choicea(_.map(
        usage
      , _.flow(_generateUsagecase, base.$, parse.attempt)));
};

module.exports.generate = generate;
