'use strict';

var _ = require('lodash')
  , parse = require('bennu').parse
  , text = require('bennu').text
  , assert = require('assert')
  , args = require('../parsers/arguments')
;

describe('baseline', function() {

    describe('ARGNAME', function() {

        var valid = [ 'ARGUMENT', 'A', 'ARG-A' ]
          , invalid = [ '', 'argument', 'aRgUmEnT', 'a', 'arg-A' ];

        it('should parse valid ARGNAMEs', function() {
            _.each(valid, function(s) {
                assert.equal(
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
                assert.equal(
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
            try{
            var group = parse.run(
                args.group
              , 'a | (b [(--c=<te>)] | d)'
            );
            }catch(e){
                console.log(e.toString());
                return;
            }

            console.log(JSON.stringify(group, null, 2));
        });
    });

    context('options', function() {
        describe('--output=<arg>', function() {
            it('should be parsed as option `output` with value `arg`', function() {
                var opt = parse.run(
                    args.option
                  , '--output=<arg>'
                );

                assert.equal(opt.type, args.OPT_TYPE.FLAG_LONG);
                assert.equal(opt.name, '--output');
                assert.equal(opt.arg, '<arg>');
            });
        });

        describe('--output <arg>', function() {
            it('should be parsed as option `output` with value `arg`', function() {
                var opt = parse.run(
                    args.option
                  , '--output <arg>'
                );

                assert.equal(opt.type, args.OPT_TYPE.FLAG_LONG);
                assert.equal(opt.name, '--output');
                assert.equal(opt.arg, '<arg>');
            });
        });

        describe('--some-feature', function() {
            it('should be parsed as flag `some-feature`', function() {
                var opt = parse.run(
                    args.option
                  , '--some-feature'
                );

                assert.equal(opt.type, args.OPT_TYPE.FLAG_LONG);
                assert.equal(opt.name, '--some-feature');
            });
        });

        describe('-f', function() {
            it('should be parsed as stacked flag `-f`', function() {
                var opt = parse.run(
                    args.option
                  , '-f'
                );

                assert.equal(opt.type, args.OPT_TYPE.FLAG_SHORT);
                assert.equal(opt.name, '-f');
            });
        });

        describe('-fFILE', function() {
            it('should be parsed as stacked flags `-f -F -I -L -E`', function() {
                var opt = parse.run(
                    args.option
                  , '-fFILE'
                );

                assert.equal(opt.type, args.OPT_TYPE.FLAG_SHORT);
                assert.equal(opt.name, '-fFILE');
            });
        });
    });
});
