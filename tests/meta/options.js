'use strict';

var _ = require('lodash')
  , parse = require('bennu').parse
  , text = require('bennu').text
  , assert = require('assert')
  , meta = require('../../lib/parse/meta')
  , util = require('../../lib/util')
;

/**
 * Tests confirming the correct behavior of the `Options` block
 * parsers, i.e.:
 *
 * Options:
 *
 *Options:
 *  -h --help     Show this screen.
 *  --version     Show version.
 *  --speed=<kn>  Speed in knots [default: 10].
 *  --moored      Moored (anchored) mine.
 *  --drifting    Drifting mine.
 */

describe('defaults', function() {

    describe('[default: "/Users/my account/"]', function() {
        it('should parse "/Users/my account/"', function() {
            var def = parse.run(
                meta.options.defaults
              , '[default: "/Users/my account/"]'
            );
            assert.strictEqual(_.isArray(def), true);
            assert.strictEqual('/Users/my account/', def[0]);
        });
    });

    describe('[default: \'/Users/my account/\']', function() {
        it('should parse \'/Users/my account/\'', function() {
            var def = parse.run(
                meta.options.defaults
              , '[default: \'/Users/my account/\']'
            );
            assert.strictEqual(_.isArray(def), true);
            assert.strictEqual('/Users/my account/', def[0]);
        });
    });

    describe('[default: /root]', function() {
        it('should parse /root', function() {
            var def = parse.run(
                meta.options.defaults
              , '[default: /root]'
            );
            assert.strictEqual(_.isArray(def), true);
            assert.strictEqual('/root', def[0]);
        });
    });

    describe('[default: /root /dev]', function() {
        it('should parse /root /dev', function() {
            var def = parse.run(
                meta.options.defaults
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
                function()  { parse.run(meta.options.line, '-a All.'); }
              , function(e) { return e instanceof parse.ParseError; }
            );
        });
    });

    describe('-a', function() {
        it('should not parse - description required', function() {
            assert.throws(
                function()  { parse.run(meta.options.line, '-a'); }
              , function(e) { return e instanceof parse.ParseError; }
            );
        });
    });

    describe('-a  All.', function() {
        it('should parse', function() {
            var option = parse.run(
                meta.options.line
              , '-a  All.'
            );

            assert.strictEqual(option.flags.long, undefined);
            assert.strictEqual(option.flags.short.name, '-a');
        });
    });

    describe('-a, --all  All.', function() {
        it('should parse', function() {

            var option = parse.run(
                meta.options.line
              , '-a, --all  All.'
            );

            assert.strictEqual(option.flags.short.name, '-a');
            assert.strictEqual(option.flags.long.name, '--all');
        });
    });

    describe('-f <file>, --file  <file>  All.', function() {
        it('should parse', function() {

            var option = parse.run(
                meta.options.line
              , '-f <file>, --file <file>  All.'
            );

            assert.strictEqual(option.flags.short.name, '-f');
            assert.strictEqual(option.flags.short.arg, '<file>');
            assert.strictEqual(option.flags.long.name, '--file');
            assert.strictEqual(option.flags.long.arg, '<file>');
        });
    });

    describe('-a, --all  All.', function() {
        it('should parse', function() {

            var option = parse.run(
                meta.options.line
              , '-a, --all  All.'
            );

            assert.strictEqual(option.flags.short.name, '-a');
            assert.strictEqual(option.flags.long.name, '--all');
        });
    });

    describe('-a --all  All.', function() {
        it('should parse', function() {

            var option = parse.run(
                meta.options.line
              , '-a --all  All.'
            );

            assert.strictEqual(option.flags.short.name, '-a');
            assert.strictEqual(option.flags.long.name, '--all');
        });
    });

    describe('--all  All.', function() {
        it('should parse', function() {
            var option = parse.run(
                meta.options.line
              , '--all  All.'
            );

            assert.strictEqual(option.flags.short, undefined);
            assert.strictEqual(option.flags.long.name, '--all');
        });
    });

    describe('--all ALL  All.', function() {
        it('should parse', function() {
            var option = parse.run(
                meta.options.line
              , '--all ALL  All.'
            );

            assert.strictEqual(option.flags.short, undefined);
            assert.strictEqual(option.flags.long.name, '--all');
            assert.strictEqual(option.flags.long.arg,  'ALL');
        });
    });

    describe('--all=<val>  All.', function() {
        it('should parse', function() {
            var option = parse.run(
                meta.options.line
              , '--all=<val>  All.'
            );

            assert.strictEqual(option.flags.long.name, '--all');
            assert.strictEqual(option.flags.long.arg,  '<val>');
        });
    });

    describe('--all=<val>  All [default: true]', function() {
        it('should parse', function() {

            var option = parse.run(
                meta.options.line
              , '--all=<val>  All [default: true]'
            );

            assert.strictEqual(option.flags.short, undefined);
            assert.strictEqual(option.description, 'All');
            assert.strictEqual(option.defaults.length, 1);
            assert.strictEqual(option.defaults[0], 'true');
        });
    });

    describe('multiple lines', function() {
        it('should parse if aligned', function() {

            var option = parse.run(
                meta.options.line
              , '    --all=<val>  foo bar [default: 100]\n'
              + '                 qux '
            );

            assert.strictEqual(option.flags.short, undefined);
            assert.strictEqual(option.description, 'foo bar qux');
            assert.strictEqual(option.defaults.length, 1);
        });
    });

    describe('multiple lines', function() {
        it('should parse if aligned', function() {

            var option = parse.run(
                meta.options.line
              , '    --all=<val>  foo bar\n'
              + '                 qux    [default: 100]'
            );

            assert.strictEqual(option.flags.short, undefined);
            assert.strictEqual(option.description, 'foo bar qux');
            assert.strictEqual(option.defaults.length, 1);
        });
    });

    describe('[default] not at EOL', function() {
        it('should throw', function() {
            // TODO: Restrict exception type
            assert.throws(
                function() {
                    parse.run(
                        meta.options.line
                      , '    --all=<val>  foo [default: 100] bar\n'
                      + '                 qux '
                    );
                }
            );
        });
    });
});

describe('multiple options', function() {
    describe('that are aligned correctly', function() {
        it('should parse', function() {

            var opts = parse.run(
                meta.options
              , ' --foo=<val>      foo bar\n'
              + '                  qix zuc [default: 100 "salad"]\n'
              + ' --qux=<val>      micro phone\n'
              + '                  even more\n'
              + ' -b, --bar=<val>  lorem'
            );

            assert.strictEqual(opts.length, 3);

            assert.strictEqual(opts[0].flags.short, undefined);
            assert.notStrictEqual(opts[0].flags.long, undefined);
            assert.strictEqual(opts[0].defaults[0], '100');
            assert.strictEqual(opts[0].defaults[1], 'salad');

            assert.strictEqual(opts[1].flags.short, undefined);
            assert.notStrictEqual(opts[1].flags.long, undefined);

            assert.notStrictEqual(opts[2].flags.short, undefined);
            assert.notStrictEqual(opts[2].flags.long, undefined);
        });
    });

    describe('that have misaligned flags', function() {
        it('should throw', function() {
            assert.throws(
                function() {
                    parse.run(
                        meta.options
                    , ' --foo=<val>      foo bar\n'
                    + '                  qix zuc [default: 100 "salad"]\n'
                    + '   --qux=<val>      micro phone\n'
                    + '                  even more\n'
                    + ' -b, --bar=<val>  lorem'
                    );
                }
              , function(e) { return e instanceof parse.ParseError; }
            );
        });
    });

    describe('that have misaligned descriptions', function() {
        it('should throw if over-dented', function() {
            assert.throws(
                function() {
                    parse.run(
                        meta.options
                    , ' --foo=<val>  foo bar\n'
                    + '                 qix zuc\n'
                    );
                }
              , function(e) { return e instanceof parse.ParseError; }
            );
        });

        it('should throw if under-dented', function() {
            assert.throws(
                function() {
                    parse.run(
                        meta.options
                    , ' --foo=<val>  foo bar\n'
                    + '            qix zuc\n'
                    );
                }
              , function(e) { return e instanceof parse.ParseError; }
            );
        });

        it('should throw if different from first block (under)', function() {
            assert.throws(
                function() {
                    parse.run(
                        meta.options
                    , ' --foo=<val>    foo bar\n'
                    + ' --bar=<xyz>  qix zuc\n'
                    );
                }
            );
        });

        it('should throw if different from first block (over)', function() {
            assert.throws(
                function() {
                    parse.run(
                        meta.options
                    , ' --foo=<val>  foo bar\n'
                    + ' --bar=<xyz>    qix zuc\n'
                    );
                }
            );
        });
    });

    it('should parse the docopt example options', function() {
        parse.run(
            meta.options
          , util.mstr('\
                 -h --help     Show this screen.                             \n\
                 --version     Show version.                                 \n\
                 --speed=<kn>  Speed in knots [default: 10]                  \n\
                 --moored      Moored (anchored) mine.                       \n\
                 --drifting    Drifting mine.                                \n\
            ')
        );
    });
});

