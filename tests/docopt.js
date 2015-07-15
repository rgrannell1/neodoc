'use strict';

var _ = require('lodash')
  , parse = require('bennu').parse
  , assert = require('assert')
  , meta = require('../lib/parse/meta')
  , docopt = require('../lib/docopt')
;

describe('docopt', function() {
    describe('naval_fate ship <name> move <x> <y> [--speed=<kn>]', function() {

        it('should parse `ship "foo" move 10 10 --speed=10`', function() {
            var parser = docopt.generate(
                [ parse.run(
                    meta.usage.line('naval_fate')
                  , 'naval_fate ship <name> move <x> <y> [--speed=<kn>]'
                ) ]
            );

            try {
            var args = parse.run(
                parser
              , 'ship "foo" move 10 10 --speed=10'
            );
            } catch(e) { console.log(e.toString()); throw e; }

            console.log(args);
        });

        it('should parse `ship "foo" move 10 10`', function() {
            var parser = docopt.generate(
                [ parse.run(
                    meta.usage.line('naval_fate')
                  , 'naval_fate ship <name> move <x> [[--speed=<kn> --bar] --foo] <y>'
                ) ]
            );

            try {
            var args = parse.run(
                parser
              , 'ship "foo" move 10 --speed=100 --foo 10'
            );
            } catch(e) { console.log(e.toString()); throw e; }

            console.log(JSON.stringify(args, null, 2));
        });

        it('should fail to parse `ship move 10 10 --speed=10`', function() {
            var parser = docopt.generate(
                [ parse.run(
                    meta.usage.line('naval_fate')
                  , 'naval_fate ship <name> move <x> <y> [--speed=<kn>]'
                ) ]
            );

            assert.throws(
                function() {
                    var args = parse.run(
                        parser
                      , 'ship move 10 10 --speed'
                    );
                }
              , function(e) { return e instanceof parse.ParseError; }
            );
        });
    });
});
