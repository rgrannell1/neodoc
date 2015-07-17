'use strict';

var _ = require('lodash')
  , nodes = require('../nodes')
  , assert = require('assert');

/**
 * Resolve a single option that is not stacked.
 * These options' assumed argument is known and
 * thus simple to check against in the `options`.
 *
 * @param {Node<Option>} option
 * The node to resolve.
 *
 * @param {Options} options
 * The options specification that helps resolve
 * ambiguities.
 *
 * @returns {Node<?>[]}
 * Returns the resolved nodes, i.e. an option
 * node can resolve into 2 nodes if the argument
 * is not wanted (the argument then becomes a
 * positional argument).
 */
var _resolveOptionSimple = function(option, options) {

    // Find the `options` entry talking about
    // this `option`.
    var spec = _.find(options, function(opt) {
        return _.any(opt.flags, function(flag) {
            return flag.name === option.name;
        });
    });

    // See if the flags given in the `options`
    // entry are revealing whether this option
    // is ought to accept an argument.
    var takesArg = spec && _.any(spec.flags, function(flag) {
        return flag.arg === option.arg;
    });

    return (takesArg)
      ? _.assign(option, {
            resolved: true
        })
      : [ _.assign(option, {
            flag:     null
          , resolved: true
          })
        , { type:     nodes.TYPE.POSITIONAL
          , name:     option.arg
          , resolved: true
          , arg:      option.arg } ]
    ;
};

/**
 * Resolve a single stacked option.
 * Because the assumed argument is not necessarily
 * known (but can be), we must found the boundary
 * of where flags stop stacking and the argument
 * starts.
 *
 * @param {Node<Option>} option
 * The node to resolve.
 *
 * @param {Options} options
 * The options specification that helps resolve
 * ambiguities.
 *
 * @returns {Node<?>[]}
 * Returns the resolved nodes, i.e. an option
 * node can resolve into 2 nodes if the argument
 * is not wanted (the argument then becomes a
 * positional argument).
 */
var _resolveOptionStacked = function(option, options) {

    // Only consider anything past `-f`, since we need
    // at least one character to denote the actual flag.
    var stacked = _.drop(option.name, 2);

    // Only consider trailing UPPERCASE characters as
    // an appended argument to an option, i.e.:
    // `-fFILE`.
    var candidateArg = _.takeRightWhile(
        option.name, function(c) { return /[A-Z]/.test(c) })
        .join('');
    var candidateFlag = _.take(_.takeRight(
        option.name, candidateArg.length + 1), 1);

    // Match against the known database of options.
    // If not match can be found, all options are
    // exploded as argumentless.
    var match = _(options)
        .find(function(opt) {
            return ((opt.flags.arg === candidateArg)
                 && (opt.flags.short
                 &&  opt.flags.short.name === '-' + candidateFlag));
        });

    var rest = (!!match)
      ? _.drop(_.dropRight(option.name, candidateArg.length + 1), 1)
      : _.drop(option.name, 1);

    return _.map(rest, function(char) {
        return {
            type:     nodes.TYPE.OPTION
          , name:     ('-' + char)
          , arg:      ('-' + char)
          , long:     false
          , stacked:  false
          , resolved: true
        };
    }).concat(match
        ? [{ type:    nodes.TYPE.OPTION
          , name:     ('-' + candidateFlag)
          , arg:      candidateArg
          , long:     false
          , stacked:  false
          , resolved: true
          }]
        : []);
};

/**
 * Resolve a single option, i.e. should
 * `--file <file>` be an option that takes
 * `<file>` as an argument, or should this
 * be an option `--file` followed by a
 * positional argument `<file>`?
 *
 * @param {Node<Option>} option
 * The node to resolve.
 *
 * @param {Options} options
 * The options specification that helps resolve
 * ambiguities.
 *
 * @returns {Node<?>[]}
 * Returns the resolved nodes, i.e. an option
 * node can resolve into multiple nodes if the
 * argument is not wanted or if the option is
 * a stacked list of flags.
 */
var _resolveOption = function(option, options) {
    return (((option.stacked)
      ? _resolveOptionStacked
      : _resolveOptionSimple)(option, options));
};

var _resolveGroup = function(group, options) {
    return _.flatten(_.map(group, function(node) {
        return ((
            (node.resolved === true)
              ? _.identity
          : (node.type === nodes.TYPE.GROUP)
              ? _resolveGroup
          : (node.type === nodes.TYPE.OPTION)
              ? _resolveOption
          :    _.identity
        )(node, options));
    }));
};

/**
 * Return a single `usage` by looking at options.
 */
var resolve = function(usage, options) {
    return _.map(usage, _.partial(_resolveGroup, _, options));
};

module.exports = resolve;
