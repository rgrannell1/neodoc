'use strict';

var _ = require('lodash')
  , parse = require('bennu').parse
  , assert = require('assert')
  , nodes = require('../../lib/parse/nodes')
  , meta = require('../../lib/parse/meta')
;

describe('Resolver', function() {

    describe('resolves options as standalone', function() {

        it('if no options provided (--file FILE)', function() {
            var usage = parse.run(
                meta.usage.line('git')
              , 'git --file FILE'
            );

            var resolved = meta.resolve(usage, []);

            assert.strictEqual(resolved[0].length, 2);
            assert.strictEqual(resolved[0][0].type, nodes.TYPE.OPTION);
            assert.strictEqual(resolved[0][1].type, nodes.TYPE.POSITIONAL);
        });

        it('if flag arg does not match (--file FILE)', function() {
            var usage = parse.run(
                meta.usage.line('git')
              , 'git --file FILE'
            );

            var option = parse.run(
                meta.options.line
             , '-f, --file FOO  The file to use.'
            );

            var resolved = meta.resolve(usage, [ option ]);

            assert.strictEqual(resolved[0].length, 2);
            assert.strictEqual(resolved[0][0].type, nodes.TYPE.OPTION);
            assert.strictEqual(resolved[0][1].type, nodes.TYPE.POSITIONAL);
        });

        it('if no options provided (-f FILE)', function() {
            var usage = parse.run(
                meta.usage.line('git')
              , 'git -f FILE'
            );

            var resolved = meta.resolve(usage, []);

            assert.strictEqual(resolved[0].length, 2);
            assert.strictEqual(resolved[0][0].type, nodes.TYPE.OPTION);
            assert.strictEqual(resolved[0][1].type, nodes.TYPE.POSITIONAL);
        });

        it('if flag arg does not match (-f FILE)', function() {
            var usage = parse.run(
                meta.usage.line('git')
              , 'git -f FILE'
            );

            var option = parse.run(
                meta.options.line
             , '-f, --file FOO  The file to use.'
            );

            var resolved = meta.resolve(usage, [ option ]);

            assert.strictEqual(resolved[0].length, 2);
            assert.strictEqual(resolved[0][0].type, nodes.TYPE.OPTION);
            assert.strictEqual(resolved[0][1].type, nodes.TYPE.POSITIONAL);
        });
    });

    describe('resolves options as options with argument', function() {

        it('if flag arg matches (--file FILE)', function() {
            var usage = parse.run(
                meta.usage.line('git')
              , 'git --file FILE'
            );

            var option = parse.run(
                meta.options.line
             , '-f, --file FILE  The file to use.'
            );

            var resolved = meta.resolve(usage, [ option ]);

            assert.strictEqual(resolved[0].length, 1);
            assert.strictEqual(resolved[0][0].type, nodes.TYPE.OPTION);
            assert.strictEqual(resolved[0][0].arg, 'FILE');
        });

        it('if flag arg matches (-f FILE)', function() {
            var usage = parse.run(
                meta.usage.line('git')
              , 'git -f FILE'
            );

            var option = parse.run(
                meta.options.line
             , '-f, --file FILE  The file to use.'
            );

            var resolved = meta.resolve(usage, [ option ]);

            assert.strictEqual(resolved[0].length, 1);
            assert.strictEqual(resolved[0][0].type, nodes.TYPE.OPTION);
            assert.strictEqual(resolved[0][0].arg, 'FILE');
        });

        it('if equals sign was used', function() {
            var usage = parse.run(
                meta.usage.line('git')
              , 'git --file=FILE'
            );

            console.log(usage);

            var option = parse.run(
                meta.options.line
             , '-f, --file FOO  The file to use.'
            );

            var resolved = meta.resolve(usage, [ option ]);

            assert.strictEqual(resolved[0].length, 1);
            assert.strictEqual(resolved[0][0].type, nodes.TYPE.OPTION);
            assert.strictEqual(resolved[0][0].arg, 'FILE');
        });
    });
});
