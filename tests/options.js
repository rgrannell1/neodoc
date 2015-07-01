'use strict';

var _ = require('lodash')
  , parse = require('bennu').parse
  , text = require('bennu').text
  , assert = require('assert')
  , options = require('../parsers/options')
;

describe('baseline', function() {
    describe('[default: ./root]', function() {
        it('should parse "./root"', function() {
            var def = parse.run(
                options.defaults
              , '[default: ./root]'
            );
            assert.equal('./root', def);
        })
    });
});

describe('options', function() {
    describe('-a All.', function() {
        it('should not parse - 2 spaces required', function() {
            assert.throws(
                function()  { parse.run(options.option, '-a All.'); }
              , function(e) { return e instanceof parse.ParseError; }
            );
        });
    });

    describe('-a  All.', function() {
        it('should parse', function() {
            var option = parse.run(
                options.option
              , '-a  All.'
            );
        });
    });

    describe('-a, --all  All.', function() {
        it('should parse', function() {
            var option = parse.run(
                options.option
              , '-a, --all  All.'
            );
        });
    });

    describe('--all  All.', function() {
        it('should parse', function() {
            var option = parse.run(
                options.option
              , '--all  All.'
            );
        });
    });

    describe('--all=<val>  All.', function() {
        it('should parse', function() {
            var option = parse.run(
                options.option
              , '--all=<val>  All.'
            );
        });
    });
});
