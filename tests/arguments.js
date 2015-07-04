'use strict';

var _ = require('lodash')
  , parse = require('bennu').parse
  , text = require('bennu').text
  , assert = require('assert')
  , args = require('../parsers/arguments')
;

describe('meta', function() {

    describe('ARGNAME', function() {

        var valid = [ 'ARGUMENT', 'A', 'ARG-A' ]
          , invalid = [ '', 'argument', 'aRgUmEnT', 'a', 'arg-A' ];

        it('should parse valid ARGNAMEs', function() {
            _.each(valid, function(s) {
                assert.strictEqual(
                    s
                  , parse.run(args.ARGNAME, s)
                );
            });
        });

        it('should not parse invalid ARGNAMEs', function() {
            _.each(invalid, function(s) {
                assert.throws(
                    function()  { parse.run(args.ARGNAME, s); }
                  , function(e) { return e instanceof parse.ParseError; }
                );
            });
        });
    });

    describe('<argument>', function() {

        var valid   = [ '<argument>', '<a>', '<arg-a>' ]
          , invalid = [ '', '<A>', '<ARG-a>', '<argument'
                      , 'argument>', '<-argument>'
                      , '<ARGUMENT>' ];

        it('should parse valid <argument>s', function() {
            _.each(valid, function(s) {
                assert.strictEqual(
                    s
                  , parse.run(args._argname_, s)
                );
            });
        });

        it('should not parse invalid <argument>s', function() {
            _.each(invalid, function(s) {
                assert.throws(
                    function()  { parse.run(args._argname_, s); }
                  , function(e) { return e instanceof parse.ParseError; }
                );
            });
        });
    });

    describe('groups', function() {
        it('should parse', function() {
            var group = parse.run(
                args.meta.group
              , 'a | (b [(--c=<te>)] | d)'
            );
        });
    });

    context('options', function() {
        describe('--output=<arg>', function() {
            it('should be parsed as option `output` with value `arg`', function() {
                var opt = parse.run(
                    args.meta.option
                  , '--output=<arg>'
                );

                assert.strictEqual(opt.type, args.OPT_TYPE.FLAG_LONG);
                assert.strictEqual(opt.name, '--output');
                assert.strictEqual(opt.arg, '<arg>');
            });
        });

        describe('--output <arg>', function() {
            it('should be parsed as option `output` with value `arg`', function() {
                var opt = parse.run(
                    args.meta.option
                  , '--output <arg>'
                );

                assert.strictEqual(opt.type, args.OPT_TYPE.FLAG_LONG);
                assert.strictEqual(opt.name, '--output');
                assert.strictEqual(opt.arg, '<arg>');
            });
        });

        describe('--some-feature', function() {
            it('should be parsed as flag `some-feature`', function() {
                var opt = parse.run(
                    args.meta.option
                  , '--some-feature'
                );

                assert.strictEqual(opt.type, args.OPT_TYPE.FLAG_LONG);
                assert.strictEqual(opt.name, '--some-feature');
            });
        });

        describe('-f', function() {
            it('should be parsed as stacked flag `-f`', function() {
                var opt = parse.run(
                    args.meta.option
                  , '-f'
                );

                assert.strictEqual(opt.type, args.OPT_TYPE.FLAG_SHORT);
                assert.strictEqual(opt.name, '-f');
            });
        });

        describe('-fFILE', function() {
            it('should be parsed as stacked flags `-f -F -I -L -E`', function() {
                var opt = parse.run(
                    args.meta.option
                  , '-fFILE'
                );

                assert.strictEqual(opt.type, args.OPT_TYPE.FLAG_SHORT);
                assert.strictEqual(opt.name, '-fFILE');
            });
        });
    });
});

describe('input', function() {
    describe('-f "./root"', function() {
        it('should parse', function() {
            var opt = parse.run(
                args.option(true)
              , '-f "./root"'
            );

            assert.strictEqual(opt.type, args.OPT_TYPE.FLAG_SHORT);
            assert.strictEqual(opt.name, '-f');
            assert.strictEqual(opt.arg, './root');
        });
    });

    describe('-f \'./root\'', function() {
        it('should parse', function() {
            var opt = parse.run(
                args.option(true)
              , '-f \'./root\''
            );

            assert.strictEqual(opt.type, args.OPT_TYPE.FLAG_SHORT);
            assert.strictEqual(opt.name, '-f');
            assert.strictEqual(opt.arg, './root');
        });
    });

    describe('-f ./root', function() {
        it('should parse', function() {
            var opt = parse.run(
                args.option(true)
              , '-f ./root'
            );

            assert.strictEqual(opt.type, args.OPT_TYPE.FLAG_SHORT);
            assert.strictEqual(opt.name, '-f');
            assert.strictEqual(opt.arg, './root');
        });
    });

    describe('-abcf ./root', function() {
        it('should parse', function() {
            var opt = parse.run(
                args.option(true)
              , '-abcf ./root'
            );

            assert.strictEqual(opt.type, args.OPT_TYPE.FLAG_SHORT);
            assert.strictEqual(opt.name, '-abcf');
            assert.strictEqual(opt.arg, './root');
        });
    });

    describe('-abcf "./root"', function() {
        it('should parse', function() {
            var opt = parse.run(
                args.option(true)
              , '-abcf "./root"'
            );

            assert.strictEqual(opt.type, args.OPT_TYPE.FLAG_SHORT);
            assert.strictEqual(opt.name, '-abcf');
            assert.strictEqual(opt.arg, './root');
        });
    });

    describe('-abcf \'./root\'', function() {
        it('should parse', function() {
            var opt = parse.run(
                args.option(true)
              , '-abcf \'./root\''
            );

            assert.strictEqual(opt.type, args.OPT_TYPE.FLAG_SHORT);
            assert.strictEqual(opt.name, '-abcf');
            assert.strictEqual(opt.arg, './root');
        });
    });

    describe('--output-file "./root"', function() {
        it('should parse', function() {
            var opt = parse.run(
                args.option(true)
              , '--output-file "./root"'
            );

            assert.strictEqual(opt.type, args.OPT_TYPE.FLAG_LONG);
            assert.strictEqual(opt.name, '--output-file');
            assert.strictEqual(opt.arg, './root');
        });
    });

    describe('--output-file \'./root\'', function() {
        it('should parse', function() {
            var opt = parse.run(
                args.option(true)
              , '--output-file \'./root\''
            );

            assert.strictEqual(opt.type, args.OPT_TYPE.FLAG_LONG);
            assert.strictEqual(opt.name, '--output-file');
            assert.strictEqual(opt.arg, './root');
        });
    });

    describe('--output-file ./root', function() {
        it('should parse', function() {
            var opt = parse.run(
                args.option(true)
              , '--output-file ./root'
            );

            assert.strictEqual(opt.type, args.OPT_TYPE.FLAG_LONG);
            assert.strictEqual(opt.name, '--output-file');
            assert.strictEqual(opt.arg, './root');
        });
    });

    describe('--output-file="./root"', function() {
        it('should parse', function() {
            var opt = parse.run(
                args.option(true)
              , '--output-file="./root"'
            );

            assert.strictEqual(opt.type, args.OPT_TYPE.FLAG_LONG);
            assert.strictEqual(opt.name, '--output-file');
            assert.strictEqual(opt.arg, './root');
        });
    });

    describe('--output-file=\'./root\'', function() {
        it('should parse', function() {
            var opt = parse.run(
                args.option(true)
              , '--output-file=\'./root\''
            );

            assert.strictEqual(opt.type, args.OPT_TYPE.FLAG_LONG);
            assert.strictEqual(opt.name, '--output-file');
            assert.strictEqual(opt.arg, './root');
        });
    });

    describe('--output-file=./root', function() {
        it('should parse', function() {
            var opt = parse.run(
                args.option(true)
              , '--output-file=./root'
            );

            assert.strictEqual(opt.type, args.OPT_TYPE.FLAG_LONG);
            assert.strictEqual(opt.name, '--output-file');
            assert.strictEqual(opt.arg, './root');
        });
    });
});
