'use strict';

var _ = require('lodash')
  , parse = require('bennu').parse
  , text = require('bennu').text
  , assert = require('assert')
  , args = require('../parsers/args')
  , struct = require('../parsers/structures')
;

describe('required arguments', function() {
    describe('()', function() {
        it('should not parse', function() {
            assert.throws(
                function()  { parse.run(struct.required, '()'); }
              , function(e) { return e instanceof parse.ParseError; }
            );
        });
    });

    describe('(--foo |)', function() {
        it('should not parse', function() {
            assert.throws(
                function()  { parse.run(struct.required, '(--foo |)'); }
              , function(e) { return e instanceof parse.ParseError; }
            );
        });
    });

    describe('(| --foo)', function() {
        it('should not parse', function() {
            assert.throws(
                function()  { parse.run(struct.required, '(| --foo)'); }
              , function(e) { return e instanceof parse.ParseError; }
            );
        });
    });

    describe('(--test)', function() {
        it('should parse', function() {
            var grp = parse.run(
                struct.required
              , '(--test)'
            );

            assert.equal(grp.TYPE, struct.TYPE.REQUIRED);
            assert.equal(_.isArray(grp.elements), true);
            assert.equal(grp.elements.length, 1);
        });
    });

    describe('(--foo --bar)', function() {
        it('should parse', function() {
            var grp = parse.run(
                struct.required
              , '(--foo --bar)'
            );

            assert.equal(grp.TYPE, struct.TYPE.REQUIRED);
            assert.equal(_.isArray(grp.elements), true);
            assert.equal(grp.elements.length, 1);
            assert.equal(grp.elements[0].length, 2);
        });
    });

    describe('(--foo --bar | --qux)', function() {
        it('should parse', function() {
            var grp = parse.run(
                struct.required
              , '(--foo --bar | --qux)'
            );

            assert.equal(grp.TYPE, struct.TYPE.REQUIRED);
            assert.equal(_.isArray(grp.elements), true);
            assert.equal(grp.elements.length, 2);
            assert.equal(grp.elements[0].length, 2);
            assert.equal(grp.elements[1].length, 1);
        });
    });

    describe('((--foo --bar))', function() {
        it('should parse', function() {
            var grp = parse.run(
                struct.required
              , '((--foo --bar))'
            );

            assert.equal(grp.TYPE, struct.TYPE.REQUIRED);
            assert.equal(_.isArray(grp.elements), true);
            assert.equal(grp.elements.length, 1);
            assert.equal(_.isArray(grp.elements[0]), true);
            assert.equal(grp.elements[0].length, 1);
            assert.equal(grp.elements[0][0].elements[0].length, 2);
        });
    });

    describe('([--foo --bar])', function() {
        it('should parse', function() {
            var grp = parse.run(
                struct.required
              , '([--foo --bar])'
            );

            assert.equal(grp.TYPE, struct.TYPE.REQUIRED);
            assert.equal(_.isArray(grp.elements), true);
            assert.equal(grp.elements.length, 1);
            assert.equal(_.isArray(grp.elements[0]), true);
            assert.equal(grp.elements[0].length, 1);
            assert.equal(grp.elements[0][0].elements[0].length, 2);
        });
    });

});

describe('optional arguments', function() {
    describe('[]', function() {
        it('should not parse', function() {
            assert.throws(
                function()  { parse.run(struct.optional, '[]'); }
              , function(e) { return e instanceof parse.ParseError; }
            );
        });
    });

    describe('[--foo |]', function() {
        it('should not parse', function() {
            assert.throws(
                function()  { parse.run(struct.required, '[--foo |]'); }
              , function(e) { return e instanceof parse.ParseError; }
            );
        });
    });

    describe('[| --foo]', function() {
        it('should not parse', function() {
            assert.throws(
                function()  { parse.run(struct.optional, '[| --foo]'); }
              , function(e) { return e instanceof parse.ParseError; }
            );
        });
    });

    describe('[--test]', function() {
        it('should parse', function() {
            var grp = parse.run(
                struct.optional
              , '[--test]'
            );

            assert.equal(grp.TYPE, struct.TYPE.OPTIONAL);
            assert.equal(_.isArray(grp.elements), true);
            assert.equal(grp.elements.length, 1);
        });
    });

    describe('[--foo --bar]', function() {
        it('should parse', function() {
            var grp = parse.run(
                struct.optional
              , '[--foo --bar]'
            );

            assert.equal(grp.TYPE, struct.TYPE.OPTIONAL);
            assert.equal(_.isArray(grp.elements), true);
            assert.equal(grp.elements.length, 1);
            assert.equal(grp.elements[0].length, 2);
        });
    });

    describe('[--foo --bar | --qux]', function() {
        it('should parse', function() {
            var grp = parse.run(
                struct.optional
              , '[--foo --bar | --qux]'
            );

            assert.equal(grp.TYPE, struct.TYPE.OPTIONAL);
            assert.equal(_.isArray(grp.elements), true);
            assert.equal(grp.elements.length, 2);
            assert.equal(grp.elements[0].length, 2);
            assert.equal(grp.elements[1].length, 1);
        });
    });
});
