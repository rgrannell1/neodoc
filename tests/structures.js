'use strict';

var _ = require('lodash')
  , parse = require('bennu').parse
  , text = require('bennu').text
  , assert = require('assert')
  , args = require('../parsers/args')
  , struct = require('../parsers/structures')
;

describe('grouped option', function() {
    describe('()', function() {
        it('should not parse', function() {
            assert.throws(
                function()  { parse.run(struct.group, '()'); }
              , function(e) { return e instanceof parse.ParseError; }
            )
        });
    });

    describe('(--test)', function() {
        it('should parse', function() {
            var group = parse.run(
                struct.group
              , '(--test)'
            );

            assert.equal(group.TYPE, struct.TYPE.GROUP);
            assert.equal(_.isArray(group.children), true);
            assert.equal(group.children.length, 1);
        })
    });

    describe('(--foo --bar)', function() {
        it('should parse', function() {
            var group = parse.run(
                struct.group
              , '(--foo --bar)'
            );

            assert.equal(group.TYPE, struct.TYPE.GROUP);
            assert.equal(_.isArray(group.children), true);
            assert.equal(group.children.length, 1);
            assert.equal(group.children[0].length, 2);
        })
    });
});
