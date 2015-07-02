'use strict';

var _ = require('lodash')
  , parse = require('bennu').parse
  , text = require('bennu').text
  , assert = require('assert')
  , options = require('../parsers/options')
;

describe('defaults', function() {

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

            assert.equal(option.flags.length, 1);
            assert.equal(option.flags[0].name, 'a');
        });
    });

    describe('-a, --all  All.', function() {
        it('should parse', function() {

            var option = parse.run(
                options.option
              , '-a, --all  All.'
            );

            assert.equal(option.flags.length, 2);
            assert.equal(option.flags[0].name, 'a');
            assert.equal(option.flags[1].name, 'all');
        });
    });

    describe('-f <file>, --file  <file>  All.', function() {
        it('should parse', function() {

            try{
            var option = parse.run(
                options.option
              , '-f <file>, --file <file>  All.'
            );
            } catch(e) {
                return console.log(e);
            }

            assert.equal(option.flags.length, 2);
            assert.equal(option.flags[0].name, 'f');
            assert.equal(option.flags[0].arg, '<file>');
            assert.equal(option.flags[1].name, 'file');
            assert.equal(option.flags[1].arg, '<file>');
        });
    });

    describe('-a, --all  All.', function() {
        it('should parse', function() {

            var option = parse.run(
                options.option
              , '-a, --all  All.'
            );

            assert.equal(option.flags.length, 2);
            assert.equal(option.flags[0].name, 'a');
            assert.equal(option.flags[1].name, 'all');
        });
    });

    describe('--all  All.', function() {
        it('should parse', function() {
            var option = parse.run(
                options.option
              , '--all  All.'
            );

            assert.equal(option.flags.length, 1);
            assert.equal(option.flags[0].name, 'all');
        });
    });

    describe('--all ALL  All.', function() {
        it('should parse', function() {
            var option = parse.run(
                options.option
              , '--all ALL  All.'
            );

            assert.equal(option.flags.length, 1);
            assert.equal(option.flags[0].name, 'all');
            assert.equal(option.flags[0].arg,  'ALL');
        });
    });

    describe('--all=<val>  All.', function() {
        it('should parse', function() {
            var option = parse.run(
                options.option
              , '--all=<val>  All.'
            );

            assert.equal(option.flags.length, 1);
            assert.equal(option.flags[0].name, 'all');
            assert.equal(option.flags[0].arg,  '<val>');
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

    describe('[default] not at EOL', function() {
        it('should throw', function() {
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

describe('multiple options', function() {
    describe('that are aligned correctly', function() {
        it('should parse', function() {

            var opts = parse.run(
                options.options
              , ' --foo=<val>      foo bar\n'
              + '                  qix zuc [default: 100 "salad"]\n'
              + ' --qux=<val>      micro phone\n'
              + '                  even more\n'
              + ' -b, --bar=<val>  lorem'
            );

            assert.strictEqual(opts.length, 3);
            assert.strictEqual(opts[0].flags.length, 1);
            assert.strictEqual(opts[0].defaults[0], '100');
            assert.strictEqual(opts[0].defaults[1], 'salad');
            assert.strictEqual(opts[1].flags.length, 1);
            assert.strictEqual(opts[2].flags.length, 2);
        });
    });

    describe('that have misaligned flags', function() {
        it('should throw', function() {
            assert.throws(
                function() {
                    parse.run(
                        options.options
                    , ' --foo=<val>      foo bar\n'
                    + '                  qix zuc [default: 100 "salad"]\n'
                    + '   --qux=<val>      micro phone\n'
                    + '                  even more\n'
                    + ' -b, --bar=<val>  lorem'
                    );
                }
              , function(e) { return e instanceof parse.ParseError; }
            )
        });
    });

    describe('that have misaligned descriptions', function() {
        it('should throw if over-dented', function() {
            assert.throws(
                function() {
                    parse.run(
                        options.options
                    , ' --foo=<val>  foo bar\n'
                    + '                 qix zuc\n'
                    );
                }
              , function(e) { return e instanceof parse.ParseError; }
            )
        });

        it('should throw if under-dented', function() {
            assert.throws(
                function() {
                    parse.run(
                        options.options
                    , ' --foo=<val>  foo bar\n'
                    + '            qix zuc\n'
                    );
                }
              , function(e) { return e instanceof parse.ParseError; }
            )
        });

        it('should throw if different from first block (under)', function() {
            assert.throws(
                function() {
                    parse.run(
                        options.options
                    , ' --foo=<val>    foo bar\n'
                    + ' --bar=<xyz>  qix zuc\n'
                    );
                }
            )
        });

        it('should throw if different from first block (over)', function() {
            assert.throws(
                function() {
                    parse.run(
                        options.options
                    , ' --foo=<val>  foo bar\n'
                    + ' --bar=<xyz>    qix zuc\n'
                    );
                }
            )
        });
    });
});
