'use strict';

var _ = require('lodash')
  , parse = require('bennu').parse
  , text = require('bennu').text
  , assert = require('assert')
  , option = require('../../lib/parse/input/option')
  , nodes = require('../../lib/parse/nodes')
;

describe('input', function() {
    describe('-f "./root"', function() {
        it('should parse', function() {
            var opt = parse.run(
                option('f', true)
              , '-f "./root"'
            );

            assert.strictEqual(opt.type, nodes.TYPE.OPTION);
            assert.strictEqual(opt.long, false);
            assert.strictEqual(opt.name, '-f');
            assert.strictEqual(opt.arg, './root');
        });
    });

    describe('-f \'./root\'', function() {
        it('should parse', function() {
            var opt = parse.run(
                option('f', true)
              , '-f \'./root\''
            );

            assert.strictEqual(opt.type, nodes.TYPE.OPTION);
            assert.strictEqual(opt.long, false);
            assert.strictEqual(opt.name, '-f');
            assert.strictEqual(opt.arg, './root');
        });
    });

    describe('-f ./root', function() {
        it('should parse', function() {
            var opt = parse.run(
                option('f', true)
              , '-f ./root'
            );

            assert.strictEqual(opt.type, nodes.TYPE.OPTION);
            assert.strictEqual(opt.long, false);
            assert.strictEqual(opt.name, '-f');
            assert.strictEqual(opt.arg, './root');
        });
    });

    describe('--output-file "./root"', function() {
        it('should parse', function() {
            var opt = parse.run(
                option('output-file', true)
              , '--output-file "./root"'
            );

            assert.strictEqual(opt.type, nodes.TYPE.OPTION);
            assert.strictEqual(opt.long, true);
            assert.strictEqual(opt.name, '--output-file');
            assert.strictEqual(opt.arg, './root');
        });
    });

    describe('--output-file \'./root\'', function() {
        it('should parse', function() {
            var opt = parse.run(
                option('output-file', true)
              , '--output-file \'./root\''
            );

            assert.strictEqual(opt.type, nodes.TYPE.OPTION);
            assert.strictEqual(opt.long, true);
            assert.strictEqual(opt.name, '--output-file');
            assert.strictEqual(opt.arg, './root');
        });
    });

    describe('--output-file ./root', function() {
        it('should parse', function() {
            var opt = parse.run(
                option('output-file', true)
              , '--output-file ./root'
            );

            assert.strictEqual(opt.type, nodes.TYPE.OPTION);
            assert.strictEqual(opt.long, true);
            assert.strictEqual(opt.name, '--output-file');
            assert.strictEqual(opt.arg, './root');
        });
    });

    describe('--output-file="./root"', function() {
        it('should parse', function() {
            var opt = parse.run(
                option('output-file', true)
              , '--output-file="./root"'
            );

            assert.strictEqual(opt.type, nodes.TYPE.OPTION);
            assert.strictEqual(opt.long, true);
            assert.strictEqual(opt.name, '--output-file');
            assert.strictEqual(opt.arg, './root');
        });
    });

    describe('--output-file=\'./root\'', function() {
        it('should parse', function() {
            var opt = parse.run(
                option('output-file', true)
              , '--output-file=\'./root\''
            );

            assert.strictEqual(opt.type, nodes.TYPE.OPTION);
            assert.strictEqual(opt.long, true);
            assert.strictEqual(opt.name, '--output-file');
            assert.strictEqual(opt.arg, './root');
        });
    });

    describe('--output-file=./root', function() {
        it('should parse', function() {
            var opt = parse.run(
                option('output-file', true)
              , '--output-file=./root'
            );

            assert.strictEqual(opt.type, nodes.TYPE.OPTION);
            assert.strictEqual(opt.long, true);
            assert.strictEqual(opt.name, '--output-file');
            assert.strictEqual(opt.arg, './root');
        });
    });
});
