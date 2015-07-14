'use strict';

var _ = require('lodash')
  , parse = require('bennu').parse
  , assert = require('assert')
  , meta = require('../lib/parse/meta')
  , docopt = require('../lib/docopt')
;

describe('docopt', function() {
    describe('naval_fate ship <name> move <x> <y> [--speed=<kn>]', function() {
        describe('ship "foo" move 10 10 --speed=10', function() {
            it('should parse', function() {
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
        });

        describe('ship "foo" move 10 10', function() {
            it('should parse', function() {
                var parser = docopt.generate(
                    [ parse.run(
                        meta.usage.line('naval_fate')
                      , 'naval_fate ship <name> move <x> <y> [--speed=<kn> | --foo]'
                    ) ]
                );

                try {
                var args = parse.run(
                    parser
                  , 'ship "foo" move 10 10'
                );
                } catch(e) { console.log(e.toString()); throw e; }

                console.log(args);
            });
        });

        describe('ship move 10 10 --speed=10', function() {
            it('should fail to parse', function() {
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
                          , 'ship move 10 10 --speed=10'
                        );
                    }
                  , function(e) { return e instanceof parse.ParseError; }
                )
            });
        });
    });
});
