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
 * --file ( --foo --bar | --qux )
 *        ^^^^^^^^^^^^^^^^^^^^^^^
 *
 * or:
 *
 * --file [ --foo --bar | --qux ]
 *        ^^^^^^^^^^^^^^^^^^^^^^^
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
    return _generators[node.type](node).map(function(value) {
        return { node: node, value: value };
    });
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

    // Collect all adjacent options into groups.
    // Options can be given in any order, hence they must be parsed as such.
    // Each parse occurrence of an option must increment the options occurence
    // by one.
    var collected = _.foldl(either, function(acc, node) {
        var last = _.last(acc);
        return (last && _.last(last) && _.last(last).type === nodes.TYPE.OPTION)
          ? (last.push(node)) && acc
          : acc.push([ node ]) && acc;
    }, []);

    return base.cons.apply(null, _.map(collected, function(collection) {
        // XXX This is ugly - we know the collection is not empty and
        //     homogenous, hence we can sample it like this. Should be written
        //     differently.
        if ((_.head(collection).type === nodes.TYPE.OPTION)) {
            var available = _.map(collection, _generateNode);
            return parse.rec(function(self) {
                return parse.optional(
                    []
                  , parse.choicea(_.map(available, function(parser) {
                        return parse.attempt(base.$(parser))
                            .chain(function(output) {
                                available = _.without(parser);
                                return self.map(function(outputs) {
                                    return [ output ].concat(outputs);
                                });
                            });
                  }))
                );
            });
        } else {
            return parse.choicea(_.map(
                collection
              , _.flow(_generateNode, base.$, parse.attempt)
            ));
        }
    })).map(_.flatten);
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
