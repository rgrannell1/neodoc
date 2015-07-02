'use strict';

var _ = require('lodash')
  , parse = require('bennu').parse
  , text = require('bennu').text
  , assert = require('assert')
  , options = require('../parsers/options')
;

describe('baseline', function() {

    describe('[default: "/Users/my account/"]', function() {
        it('should parse "/Users/my account/"', function() {
            var def = parse.run(
                options.defaults
              , '[default: "/Users/my account/"]'
            );
            assert.strictEqual(_.isArray(def), true);
            assert.strictEqual('/Users/my account/', def[0]);
        });
    });

    describe('[default: \'/Users/my account/\']', function() {
        it('should parse \'/Users/my account/\'', function() {
            var def = parse.run(
                options.defaults
              , '[default: \'/Users/my account/\']'
            );
            assert.strictEqual(_.isArray(def), true);
            assert.strictEqual('/Users/my account/', def[0]);
        });
    });

    describe('[default: /root]', function() {
        it('should parse /root', function() {
            var def = parse.run(
                options.defaults
              , '[default: /root]'
            );
            assert.strictEqual(_.isArray(def), true);
            assert.strictEqual('/root', def[0]);
        });
    });

    describe('[default: /root /dev]', function() {
        it('should parse /root /dev', function() {
            var def = parse.run(
                options.defaults
              , '[default: /root /dev]'
            );
            assert.strictEqual(_.isArray(def), true);
            assert.strictEqual('/root', def[0]);
            assert.strictEqual('/dev', def[1]);
        });
    });
});

describe('single option block', function() {

    describe('-a All.', function() {
        it('should not parse - 2 spaces required', function() {
            assert.throws(
                function()  { parse.run(options.option, '-a All.'); }
              , function(e) { return e instanceof parse.ParseError; }
            );
        });
    });

    describe('-a', function() {
        it('should not parse - description required', function() {
            assert.throws(
                function()  { parse.run(options.option, '-a'); }
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

    describe('--all=<val>  All [default: true]', function() {
        it('should parse', function() {

            var option = parse.run(
                options.option
              , '--all=<val>  All [default: true]'
            );

            assert.strictEqual(option.flags.length, 1);
            assert.strictEqual(option.description, 'All');
            assert.strictEqual(option.defaults.length, 1);
            assert.strictEqual(option.defaults[0], 'true');
        });
    });

    describe('multiple lines', function() {
        it('should parse if aligned', function() {

            var option = parse.run(
                options.option
              , '    --all=<val>  foo bar [default: 100]\n'
              + '                 qux '
            );

            assert.strictEqual(option.flags.length, 1);
            assert.strictEqual(option.description, 'foo bar qux');
            assert.strictEqual(option.defaults.length, 1);
        });
    });

    describe('multiple lines', function() {
        it('should parse if aligned', function() {

            var option = parse.run(
                options.option
              , '    --all=<val>  foo bar\n'
              + '                 qux    [default: 100]'
            );

            assert.strictEqual(option.flags.length, 1);
            assert.strictEqual(option.description, 'foo bar qux');
            assert.strictEqual(option.defaults.length, 1);
        });
    });

    describe('[default] should throw if not at EOL', function() {
        it('should parse if aligned', function() {
            // TODO: Restrict exception type.
            assert.throws(
                function() {
                    parse.run(
                        options.option
                      , '    --all=<val>  foo [default: 100] bar\n'
                      + '                 qux '
                    );
                }
            );
        });
    });
});

describe('options', function() {
    describe('multiple options', function() {
        it('should parse', function() {

            try{
            var option = parse.run(
                options.options
              , '   --foo=<val>  foo bar\n'
              + '                 qix zuc [default: 100]\n'
              + '   --qux=<val>  micro phone\n'
              + '                 even more\n'
              // + '    --qux=<val>  lorem'
            );
            } catch(e) {
                console.log(e.toString());
            }

            console.log(option);
        });
    });
});
