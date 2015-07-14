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
 * @param {Node.<Group>} node
 * The node to generate a parser for
 *
 * @returns {Parser}
 */
_generators[nodes.TYPE.GROUP] = function(node) {
    return ((node.modifiers.optional === true)
      ? parse.attempt
      : _.identity)(_generateGroup(node));
};

module.exports.generate = generate;
