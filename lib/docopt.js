'use strict';

var _ = require('lodash')
  , parse = require('bennu').parse
  , text = require('bennu').text
  , assert = require('assert')
  , base = require('./parse/base')
  , meta = require('./parse/meta')
  , nodes = require('./parse/nodes')
;


var _generateGroup = function(group, options) {
    return base.cons.apply(null, _.map(_.map(
        _.foldl(group, function(acc, node) {
            return (function(head, rest) {
                console.log('node', node);

                return (

                // ----------------
                // Parse `command`s
                // ----------------
                (node.type === nodes.OPT_TYPE.COMMAND)
                  ? acc.concat({
                        node:   node
                      , parser: text.string(node.name)
                    })

                // ----------------------------
                // Parse `positional` arguments
                // ----------------------------
                : (node.type === nodes.OPT_TYPE.POSITIONAL)
                  ? acc.concat({
                        node:   node
                      , parser: meta.argument.positional
                    })

                // -----------------------
                // Parse `flags` arguments
                // -----------------------
                : (node.type === nodes.OPT_TYPE.FLAG_LONG)
                  ? ((head.node.type === nodes.OPT_TYPE.FLAG_LONG)
                      ? [ { node:   node
                          , parser: parse.optional(parse.either(
                                parse.attempt(head.parser)
                              , parse.attempt(meta.option)
                            ))
                          }
                        , rest ]
                      : acc.concat({
                            node:   node
                          , parser: parse.optional(meta.argument.option)
                      })
                    )

                // --------------------------
                // Parse `groups` recursively
                // XXX
                // --------------------------
                : (node.type === args.OPT_TYPE.POSITIONAL)
                  ? acc.concat({
                        node:   node
                      , parser: args.positional
                    })

                  : acc
                );

            }(_.head(acc), (_.drop(acc, 1) || [])));
        }, [])
      , 'parser'), base.$));
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
