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

