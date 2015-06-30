'use strict';

var _ = require('lodash')
  , Promise = require('bluebird')
  , parse = require('bennu').parse
  , parseInc = require('bennu').incremental
  , lang = require('bennu').lang
  , text = require('bennu').text
  , fs = require('fs')
  , nu = require('nu-stream')
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
    return parse.chain(p, function(xs) {
        return parse.of(f(xs));
    });
};

/**
 * Concatenate the results of a parse.
 *
 * @param {String} sep
 * The separator to use.
 *
 * @param {Parser} parser
 * The parser to apply the concatenation on.
 *
 * @returns {Parser}
 */
var concatWith = function(sep, parser) {
    return transform(parser, function(xs) {
        return xs.join(sep);
    });
};

/* @see concatWith */
var concat = _.partial(concatWith, '');

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
 * Parse the program name.
 */
var program = concat(eager1(text.match(/[0-9a-z_\-.]/)));

/**
 * Parse an ARGUMENT name
 */
var ARGNAME = cons(
    text.match(/[A-Z]/)
  , concat(eager(text.match(/[A-Z\-]/))));

/**
 * Parse an argument
 */
var argname = cons(
    text.match(/[a-z]/)
  , concat(eager(text.match(/[a-z\-]/))));

/**
 * Parses an argument, either:
 *
 * `ARGUMENT` or `<argument>`
 */
var positionalArg = parse.either(
    ARGNAME
  , lang.between(
        text.character('<')
      , text.character('>')
      , argname
    )
);

var ARG_TYPE = {
    FLAG:     'FLAG'
  , POSITION: 'POSITION'
  , OPTION:   'OPTION'
};

/**
 * Parse a single option, i.e.:
 *     --output=<arg>
 *     --some-flag
 *     -s
 *     -abc
 */
var optionArg = lang.then(parse.choice(
    parse.attempt(
        cons(
            text.string('--')
          , argname
          , text.string('=')
          , lang.between(
                text.character('<')
              , text.character('>')
              , argname
            )))
  , parse.attempt(
        cons(text.string('--'), argname))
), parse.many(text.space));


var maybeOptionalArg = function(parser) {
    return parse.either(
        transform(
            lang.between(
                text.character('[')
              , text.character(']')
              , parser
            )
          , function(name) { return { arg: name, optional: true } }
        )
      , transform(
            parser
          , function(name) { return { arg: name, optional: false } }
        )
    )
};

var argument = parse.choice(
    maybeOptionalArg(parse.attempt(optionArg))
  , maybeOptionalArg(parse.attempt(positionalArg))
);

/*
 * Parses a single `usage` row, i.e. one of:
 *
 *   naval_fate ship new <name>...
 *   naval_fate ship <name> move <x> <y> [--speed=<kn>]
 *   naval_fate ship shoot <x> <y>
 *   naval_fate mine (set|remove) <x> <y> [--moored|--drifting]
 *   naval_fate -h | --help
 *   naval_fate --version
 */
var usageRow = program.chain(function(name) {
    return repeatedly(parse.next(parse.many(space), argument))
        .chain(function(args) {
            return parse.of({
                name: name
              , args: args
            });
        });
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
