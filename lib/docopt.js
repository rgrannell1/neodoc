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

var _generateGroup = function(group, options) {
    return base.cons.apply(null, _.map(
        _.foldl(group, function(acc, node) {
            console.log(node, !!node.arg);
            return (function(head, rest) {
                return (

                // ----------------
                // Parse `command`s
                // ----------------
                (node.type === nodes.TYPE.COMMAND)
                  ? acc.concat({
                        node:   node
                      , parser: text.string(node.name)
                    })

                // ----------------------------
                // Parse `positional` arguments
                // ----------------------------
                : (node.type === nodes.TYPE.POSITIONAL)
                  ? acc.concat({
                        node:   node
                      , parser: input.argument.positional
                    })

                // -----------------------
                // Parse `flags` arguments
                // -----------------------
                : (node.type === nodes.TYPE.OPTION)
                  ? _([ input.argument.option(
                        (!!node.arg)
                    ) ]).map(function(parser) {
                        return (
                            (head
                          && head.node
                          && head.node.type === nodes.TYPE.OPTION)
                              ? [ { node:   node
                                  , parser: parse.choice(
                                        parse.attempt(head.parser)
                                      , parse.optional(parser)
                                    )
                                  }
                                , rest ]
                              : acc.concat({
                                    node:   node
                                  , parser: parse.optional(parser)
                                })
                        );
                    }).head()

                // // --------------------------
                // // Parse `groups` recursively
                // // XXX
                // // --------------------------
                // : (node.type === nodes.TYPE.POSITIONAL)
                //   ? acc.concat({
                //         node:   node
                //       , parser: input.argument.positional
                //     })

                  : acc
                );

            }(_.head(acc), (_.drop(acc, 1) || [])));
        }, [])
      , function(segment) {
            return base.$(segment.parser).map(function(output) {
                return {
                    input:  segment.node
                  , output: output
                };
            });
        }
    ));
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
