'use strict';

var _ = require('lodash')
  , parse = require('bennu').parse
  , assert = require('assert')
  , meta = require('../lib/parse/meta')
  , docopt = require('../lib/docopt')
;

describe('docopt', function() {

    var runParser = function(p, c) {
        try {
            return parse.run(p, c);
        } catch(e) {
            console.log(e.toString());
            throw e;
        }
    };

    describe('naval_fate ship <name> move <x> <y> [--speed=<kn>]', function() {

        it('should parse `ship "foo" move 10 10 --speed=10`', function() {
            var parser = docopt.generate(
                [ runParser(
                    meta.usage.line('naval_fate')
                  , 'naval_fate ship <name> move <x> <y> [--speed=<kn>]'
                ) ]
            );

            var args = runParser(
                parser
              , 'ship "foo" move 10 10 --speed=10');

            console.log(JSON.stringify(args, null, 2));
        });

        it('should parse `ship "foo" move 10 10`', function() {
            var parser = docopt.generate(
                [ runParser(
                    meta.usage.line('naval_fate')
                  , 'naval_fate ship <name> move <x> [[--speed=<kn> --bar] --foo] <y>'
                ) ]
            );

            var args = runParser(
                parser
              , 'ship "foo" move 10 --speed=100 --foo 10');

            console.log(JSON.stringify(args, null, 2));
        });

        it('should fail to parse `ship move 10 10 --speed=10`', function() {
            var parser = docopt.generate(
                [ runParser(
                    meta.usage.line('naval_fate')
                  , 'naval_fate ship <name> move <x> <y> [--speed=<kn>]'
                ) ]
            );

            assert.throws(
                function() {
                    var args = runParser(
                        parser
                      , 'ship move 10 10 --speed'
                    );
                }
              , function(e) { return e instanceof parse.ParseError; }
            );
        });
    });
});
