'use strict';

var _ = require('lodash')
  , parse = require('bennu').parse
  , text = require('bennu').text
  , assert = require('assert')
  , meta = require('../../lib/parse/meta')
  , nodes = require('../../lib/parse/nodes')
;

describe('meta', function() {

    describe('ARGNAME', function() {

        var valid = [ 'ARGUMENT', 'A', 'ARG-A' ]
          , invalid = [ '', 'argument', 'aRgUmEnT', 'a', 'arg-A' ];

        it('should parse valid ARGNAMEs', function() {
            _.each(valid, function(s) {
                assert.strictEqual(
                    s
                  , parse.run(meta.argument.ARGNAME, s)
                );
            });
        });

        it('should not parse invalid ARGNAMEs', function() {
            _.each(invalid, function(s) {
                assert.throws(
                    function()  { parse.run(meta.argument.ARGNAME, s); }
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
                  , parse.run(meta.argument._argname_, s)
                );
            });
        });

        it('should not parse invalid <argument>s', function() {
            _.each(invalid, function(s) {
                assert.throws(
                    function()  { parse.run(meta.argument._argname_, s); }
                  , function(e) { return e instanceof parse.ParseError; }
                );
            });
        });
    });

    describe('groups', function() {
        it('should parse', function() {
            var group = parse.run(
                meta.usage.group
              , 'a | (b [(--c=<te>)] | d)'
            );
        });
    });

    context('options', function() {
        describe('--output=<arg>', function() {
            it('should be parsed as option `output` with value `arg`', function() {
                var opt = parse.run(
                    meta.argument.option
                  , '--output=<arg>'
                );

                assert.strictEqual(opt.type, nodes.TYPE.FLAG_LONG);
                assert.strictEqual(opt.name, '--output');
                assert.strictEqual(opt.arg, '<arg>');
            });
        });

        describe('--output <arg>', function() {
            it('should be parsed as option `output` with value `arg`', function() {
                var opt = parse.run(
                    meta.argument.option
                  , '--output <arg>'
                );

                assert.strictEqual(opt.type, nodes.TYPE.FLAG_LONG);
                assert.strictEqual(opt.name, '--output');
                assert.strictEqual(opt.arg, '<arg>');
            });
        });

        describe('--some-feature', function() {
            it('should be parsed as flag `some-feature`', function() {
                var opt = parse.run(
                    meta.argument.option
                  , '--some-feature'
                );

                assert.strictEqual(opt.type, nodes.TYPE.FLAG_LONG);
                assert.strictEqual(opt.name, '--some-feature');
            });
        });

        describe('-f', function() {
            it('should be parsed as stacked flag `-f`', function() {
                var opt = parse.run(
                    meta.argument.option
                  , '-f'
                );

                assert.strictEqual(opt.type, nodes.TYPE.FLAG_SHORT);
                assert.strictEqual(opt.name, '-f');
            });
        });

        describe('-fFILE', function() {
            it('should be parsed as stacked flags `-f -F -I -L -E`', function() {
                var opt = parse.run(
                    meta.argument.option
                  , '-fFILE'
                );

                assert.strictEqual(opt.type, nodes.TYPE.FLAG_SHORT);
                assert.strictEqual(opt.name, '-fFILE');
            });
        });
    });
});

