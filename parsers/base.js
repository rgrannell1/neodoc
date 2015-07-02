'use strict';

var _ = require('lodash')
  , parse = require('bennu').parse
  , lang = require('bennu').lang
  , text = require('bennu').text
;

/**
 * The casing to use for matching strings.
 *
 * @enum
 * @readonly
 */
var Casing = {
    SENSITIVE:   'SENSITIVE'
  , INSENSITIVE: 'INSENSITIVE'
};

/**
 * Parse a string.
 *
 * @param {String} s
 * The string to match.
 *
 * @param {Casing|Boolean} casing
 * The casing to use when matching.
 */
var string = function(str, casing) {
    casing = (typeof casing === 'string')
                ? casing
           : (typeof casing === 'boolean')
                ? (casing ? Casing.SENSITIVE : Casing.INSENSITIVE)
           : Casing.INSENSITIVE;
    return parse.attempt(_.foldr(str, function(p, c, i, s) {
        return parse.next(parse.token(function(t) {
            return ((t === c)
              || (casing === Casing.INSENSITIVE
                  && t.toLowerCase() === c.toLowerCase()));
        }), p);
    }, parse.always(str)));
};

/**
 * Parse a space character.
 */
var space = text.match(/[ ]/, 'space');

/**
 * Run function `f` on the result
 * of the parser `p`.
 *
 * @param {Parser}
 * The parser to run the function on.
 *
 * @param {Function} f
 * The function to apply to the results.
 *
 * @return {Parser}
 */
var transform = function(p, f) {
    return p.chain(function(xs) {
        return parse.of(f(xs));
    });
};

/**
 * Concatenate the results of a parse.
 *
 * @param {String} [sep]
 * The separator to use.
 *
 * @param {Parser} parser
 * The parser to apply the concatenation on.
 *
 * @returns {Parser}
 */
var join = function(sep, parser) {

    if (typeof sep !== 'string') {
        parser = sep;
        sep = '';
    }

    return transform(parser, function(xs) {
        return _.isArray(xs)
          ? xs.join(sep)
          : xs;
    });
};

/**
 * Consume a repeating parser `parser` eagerly.
 *
 * @param {Parser} parser
 * The parser to repeat using `parse.many`
 *
 * @returns {Parser}
 */
var eager = function(parser) {
    return parse.eager(parse.many(parser));
};

/**
 * Consume a repeating parser `parser` eagerly.
 *
 * Must at least make one match.
 *
 * @param {Parser} parser
 * The parser to repeat using `parse.many`
 *
 * @returns {Parser}
 */
var eager1 = function(parser) {
    return parse.eager(parse.many1(parser));
};

/**
 * Fold over all give parsers, applying
 * them in sequence and consing their results
 * into an array.
 *
 * @param {...Parser} parsers
 * The parsers to sequence and cons.
 *
 * @returns {Parser}
 */
var cons = function() {
    return _.foldl(_.toArray(arguments), function(acc, parser) {
        return acc.chain(function(accout) {
            return parser.chain(function(parserout) {
                // accout = _.isArray(accout) ? accout : [ accout ];
                return parse.of(accout.concat([ parserout ]));
            });
        });
    }, parse.of([]));
};

/**
 * Collect all parsers and run `f`
 * on them
 */
var all = function() {
    return _.foldl(_.toArray(arguments), function(acc, parser) {
        return acc.chain(function(accout) {
            return parser.chain(function(parserout) {
                accout = _.isArray(accout) ? accout : [ accout ];
                return parse.of(accout.concat([ parserout ]));
            });
        });
    });
};


/**
 * Runs a parser recursively, collecting
 * results of `parser` in a list.
 *
 * @param {Parser} parser
 * The parser to run repeatedly
 *
 * @returns {Parser}
 */
var repeatedly = function(parser) {
    return parse.rec(function(self) {
        return parse.optional([],
            parser.chain(function(x) {
                return self.chain(function(xs) {
                    return parse.of([x].concat(xs));
                });
            })
        );
    });
};

/**
 * Ignore white space before and after
 */
var $ = function(p) {
    return lang.then(
        parse.next(parse.many(space), p)
      , parse.many(space)
    );
};

/**
 * Parse a quoted string.
 *
 * @param {Char} delim
 * The character to use for quotes, i.e. `'` or `"`.
 *
 * @returns {Parser}
 */
var quoted = function(delim) {
    return join(lang.between(
        text.character(delim)
      , text.character(delim)
      , eager(text.noneOf(delim))
    ));
};

/**
 * Fail with message
 *
 * @param {String} msg
 * The error message.
 *
 * @returns {Parser}
 */
var fail = function(msg) {
    return parse.getPosition.chain(function(p) {
        return parse.never(new parse.ParseError(p, msg));
    });
};

module.exports.$ = $;
module.exports.string = string;
module.exports.string.Casing = Casing;
module.exports.space = space;
module.exports.transform = transform;
module.exports.join = join;
module.exports.eager = eager;
module.exports.eager1 = eager1;
module.exports.cons = cons;
module.exports.repeatedly = repeatedly;
module.exports.quoted = quoted;
module.exports.singleQuoted = quoted('\'');
module.exports.doubleQuoted = quoted('"');
module.exports.fail = fail;
