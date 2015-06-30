'use strict';

var _ = require('lodash')
  , Promise = require('bluebird')
  , parse = require('bennu').parse
  , parseInc = require('bennu').incremental
  , lang = require('bennu').lang
  , text = require('bennu').text
  , fs = require('fs')
;

var input = fs
    .readFileSync('./tests/fixtures/0.txt')
    .toString('utf-8');

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
var string = function(s, casing) {
    casing = (typeof casing === 'string')
                ? casing
           : (typeof casing === 'boolean')
                ? (casing ? Casing.SENSITIVE : Casing.INSENSITIVE)
           : Casing.INSENSITIVE;
    return parse.attempt(_.foldr(s, function(p, c, i, s) {
        return parse.next(parse.token(function(t) {
            return ((t === c)
              || (casing === Casing.INSENSITIVE
                  && t.toLowerCase() === c.toLowerCase()));
        }), p);
    }, parse.always(s)))
};

/**
 * Parse a alpha numeric character.
 */
var alphaNum = text.match(/[0-9a-z]/i, "any letter or digit");

/**
 * Parse a space character.
 */
var space = text.match(/[ ]/, "space");

/**
 * Run function `f` on the result
 * of the parser `p`.
 *
 * @param {Function} f
 * The function to apply to the results.
 *
 * @returns {Function}
 * Returns a function that, when applied to
 * a parser, will run that parser and then
 * apply `f` to it's results.
 */
var transform = function(f) {
    return function(p) {
        return parse.chain(p, function(xs) {
            return parse.of(f(xs));
        })
    };
}

/**
 * Concatenate the results of a parse.
 *
 * @param {String} sep
 * The seperator to use.
 *
 * @param {Parser} parser
 * The parser to apply the concatenation on.
 *
 * @returns {Parser}
 */
var concatWith = function(sep, parser) {
    return transform(function(xs) {
        return xs.join(sep);
    })(parser);
};

/* @see concatWith */
var concat = _.partial(concatWith, '');

/**
 * Consume a repeating parser `parser` eagerly.
 *
 * @param {Parser} parser
 * The parter to repeat using `parse.many`
 *
 * @return {Parser}
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
 * The parter to repeat using `parse.many`
 *
 * @return {Parser}
 */
var eager1 = function(parser) {
    return parse.eager(parse.many1(parser));
};

/**
 * Parse the program name.
 */
var programName = concat(eager1(text.match(/[0-9a-z_\-.]/)));

/**
 * Parses an argument, either:
 *
 * `ARGUMENT` or `<argument>`
 */
var argument = parse.either(
    concat(eager1(text.match(/[A-Z\-]/)))
  , lang.between(
        text.character('<')
      , text.character('>')
      , concat(eager1(text.match(/[a-z\-]/i)))
    )
);

/
var usageRow = programName.chain(function(name) {

    // --------------------------------
    // Parse arguments on the same line
    // --------------------------------
    return parse.rec(function(self) {
        return parse.optional(
            []
          , parse.next(parse.many(space), argument)
                .chain(function(x) {
                    return self.chain(function(xs) {
                        return parse.of([x].concat(xs));
                    });
                })
        );
    })
        .chain(function(args) {
            console.log(args);
            return parse.of({
                name: name
              , args: args
            });
        })
});

var usage = parse.next(
    string('usage:', Casing.INSENSITIVE)
  , parse.either(
        parse.next(
            parse.many(space)
          , usageRow
        )
      , parse.always('TODO')
    )
);

try {
    console.log(parse.run(usage, input));
} catch(e) {
    console.log(e.message);
    console.log(e.stack);
}
