'use strict';

var _ = require('lodash')
  , parse = require('bennu').parse
  , text = require('bennu').text
  , assert = require('assert')
  , usage = require('../parsers/usage')
  , args = require('../parsers/arguments')
;

/**
 * Tests confirming the correct behavior of the `Usage` block
 * parsers, i.e.:
 *
 * Usage:
 *     naval_fate ship new <name>...
 *     naval_fate ship <name> move <x> <y> [--speed=<kn>]
 *     naval_fate ship shoot <x> <y>
 *     naval_fate mine (set|remove) <x> <y> [--moored|--drifting]
 *     naval_fate -h | --help
 *     naval_fate --version
 */

describe('defaults', function() {

    describe('naval_fate ship new <name>...', function() {
        it('should parse', function() {

            var line = parse.run(
                usage.line('naval_fate')
              , 'naval_fate ship new <name>...'
            );

            assert.strictEqual(line[0][0].type, args.OPT_TYPE.COMMAND);
            assert.strictEqual(line[0][0].name, 'ship');

            assert.strictEqual(line[0][1].type, args.OPT_TYPE.COMMAND);
            assert.strictEqual(line[0][1].name, 'new');

            assert.strictEqual(line[0][2].type, args.OPT_TYPE.POSITIONAL);
            assert.strictEqual(line[0][2].arg, '<name>');
            assert.strictEqual(line[0][2].modifiers.optional, false);
            assert.strictEqual(line[0][2].modifiers.repeating, true);
        });
    });

    describe('naval_fate ship <name> move <x> <y> [--speed=<kn>]', function() {
        it('should parse', function() {

            var line = parse.run(
                usage.line('naval_fate')
              , 'naval_fate ship <name> move <x> <y> [--speed=<kn>]'
            );

            assert.strictEqual(line[0][0].type, args.OPT_TYPE.COMMAND);
            assert.strictEqual(line[0][0].name, 'ship');
            assert.strictEqual(line[0][0].modifiers.repeating, false);

            assert.strictEqual(line[0][1].type, args.OPT_TYPE.POSITIONAL);
            assert.strictEqual(line[0][1].arg, '<name>');
            assert.strictEqual(line[0][1].modifiers.repeating, false);
            assert.strictEqual(line[0][1].modifiers.optional, false);

            assert.strictEqual(line[0][2].type, args.OPT_TYPE.COMMAND);
            assert.strictEqual(line[0][2].name, 'move');
            assert.strictEqual(line[0][2].modifiers.repeating, false);

            assert.strictEqual(line[0][3].type, args.OPT_TYPE.POSITIONAL);
            assert.strictEqual(line[0][3].arg, '<x>');
            assert.strictEqual(line[0][3].modifiers.repeating, false);
            assert.strictEqual(line[0][3].modifiers.optional, false);

            assert.strictEqual(line[0][4].type, args.OPT_TYPE.POSITIONAL);
            assert.strictEqual(line[0][4].arg, '<y>');
            assert.strictEqual(line[0][4].modifiers.repeating, false);
            assert.strictEqual(line[0][4].modifiers.optional, false);

            assert.strictEqual(line[0][5].type, args.OPT_TYPE.FLAG_LONG);
            assert.strictEqual(line[0][5].name, '--speed');
            assert.strictEqual(line[0][5].arg, '<kn>');
            assert.strictEqual(line[0][5].modifiers.repeating, false);
            assert.strictEqual(line[0][5].modifiers.optional, true);
        });
    });

    describe('naval_fate mine (set|remove) <x> <y> [--moored|--drifting]', function() {
        it('should parse', function() {

            var line = parse.run(
                usage.line('naval_fate')
              , 'naval_fate mine (set|remove) <x> <y> [--moored|--drifting]'
            );

            assert.strictEqual(line[0][0].type, args.OPT_TYPE.COMMAND);
            assert.strictEqual(line[0][0].name, 'mine');
            assert.strictEqual(line[0][0].modifiers.repeating, false);

            assert.strictEqual(line[0][1].type, args.OPT_TYPE.GROUP);
            assert.strictEqual(line[0][1].required, true);

            assert.strictEqual(line[0][1].nodes[0][0].type, args.OPT_TYPE.COMMAND);
            assert.strictEqual(line[0][1].nodes[0][0].name, 'set');
            assert.strictEqual(line[0][1].nodes[0][0].modifiers.repeating, false);

            assert.strictEqual(line[0][1].nodes[1][0].type, args.OPT_TYPE.COMMAND);
            assert.strictEqual(line[0][1].nodes[1][0].name, 'remove');
            assert.strictEqual(line[0][1].nodes[1][0].modifiers.repeating, false);

            assert.strictEqual(line[0][2].type, args.OPT_TYPE.POSITIONAL);
            assert.strictEqual(line[0][2].arg, '<x>');
            assert.strictEqual(line[0][2].modifiers.repeating, false);
            assert.strictEqual(line[0][2].modifiers.optional, false);

            assert.strictEqual(line[0][3].type, args.OPT_TYPE.POSITIONAL);
            assert.strictEqual(line[0][3].arg, '<y>');
            assert.strictEqual(line[0][3].modifiers.repeating, false);
            assert.strictEqual(line[0][3].modifiers.optional, false);

            assert.strictEqual(line[0][4].type, args.OPT_TYPE.GROUP);
            assert.strictEqual(line[0][4].required, false);

            assert.strictEqual(line[0][4].nodes[0][0].type, args.OPT_TYPE.FLAG_LONG);
            assert.strictEqual(line[0][4].nodes[0][0].name, '--moored');
            assert.strictEqual(line[0][4].nodes[0][0].modifiers.repeating, false);
            assert.strictEqual(line[0][4].nodes[0][0].modifiers.optional, false);

            assert.strictEqual(line[0][4].nodes[1][0].type, args.OPT_TYPE.FLAG_LONG);
            assert.strictEqual(line[0][4].nodes[1][0].name, '--drifting');
            assert.strictEqual(line[0][4].nodes[1][0].modifiers.repeating, false);
            assert.strictEqual(line[0][4].nodes[1][0].modifiers.optional, false);
        });
    });
});
