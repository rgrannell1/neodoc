'use strict';

var _ = require('lodash')
  , Promise = require('bluebird')
  , parse = require('bennu').parse
  , parseInc = require('bennu').incremental
  , lang = require('bennu').lang
  , text = require('bennu').text
  , fs = require('fs')
;


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

