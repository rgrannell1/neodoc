'use strict';

var _ = require('lodash')
  , parse = require('bennu').parse
  , text = require('bennu').text
  , assert = require('assert')
  , base = require('../parsers/base')
;

describe('string', function() {

    context('Casing.INSENSITIVE', function() {

        var _run = function(f) {
            _.each([ 'ABC', 'abc', 'AbC', 'aBc' ], function(s) {
                assert.equal(s, parse.run(f(s), s));
            })
        };

        it('should parse strings', function() {
            _run(base.string);
        });

        it('should parse strings', function() {
            _run(_.partial(base.string, _, false))
        });

        it('should parse strings', function() {
            _run(_.partial(base.string, _, base.string.Casing.INSENSITIVE));
        });
    });

    context('Casing.SENSITIVE', function() {

        it('should parse strings', function() {
            assert.equal(
                'aBC'
              , parse.run(base.string('aBC', true), 'aBC')
            );
        });

        it('should throw if case does not match', function() {
            assert.throws(
                function() {
                    parse.run(base.string('AbC', true), 'abc')
                }
              , function(e) {
                    return (e instanceof parse.ParseError)
                }
            );
        });

        it('should throw if case does not match', function() {
            assert.throws(
                function() {
                    parse.run(
                        base.string('AbC', base.string.Casing.SENSITIVE)
                      , 'abc'
                    )
                }
              , function(e) {
                    return (e instanceof parse.ParseError)
                }
            );
        });
    });
});

describe('transform', function() {
    it('should transform parse results', function() {
        assert.equal(
            8
          , parse.run(
                base.transform(
                    text.digit
                  , function(n) { return parseInt(n) * 2; })
              , '4'
            )
        );
    });
});

describe('join', function() {
    it('should join parse results with the seperator', function() {
        assert.equal(
            'a-b-c'
          , parse.run(
                base.join('-', parse.eager(parse.many(text.letter)))
              , 'abc'
            )
        );
    });
});

describe('eager', function() {
    it('should consume a repeating parser eagerly', function() {
        assert.equal(
            'abc'
          , parse.run(
                base.eager(text.letter)
              , 'abc'
            ).join('')
        );
    });

    it('should allow empty input', function() {
        assert.equal(
            ''
          , parse.run(base.eager(text.letter), '').join('')
        );
    });
});

describe('eager1', function() {
    it('should consume a repeating parser eagerly', function() {
        assert.equal(
            'abc'
          , parse.run(
                base.eager1(text.letter)
              , 'abc'
            ).join('')
        );
    });

    it('should not allow empty input', function() {
        assert.throws(
            function() {
                parse.run(base.eager1(text.letter), '').join('')
            }
          , function(e) {
                return (e instanceof parse.ParseError);
            }
        );
    });
});

describe('cons', function() {
    it('should cons all given parsers in order', function() {
        assert.equal(
            'abc'
          , parse.run(
                base.join(base.cons(
                    text.character('a')
                  , text.character('b')
                  , text.character('c')
                ))
              , 'abc'
            )
        );
    });
});

describe('repeatedly', function() {
    it('should repeatedly apply a parser', function() {
        assert.equal(
            'abc'
          , parse.run(
                base.join(base.repeatedly(text.letter))
              , 'abc'
            )
        );
    })
});

describe('$', function() {
    it('ignores all whitespace', function() {
        _.each(['a', ' aaaa', '  a', ' aa ', 'aa ', 'aaa  ', '  aa  '], function(s) {
            assert.equal(
                s.trim()
              , parse.run(
                    base.$(base.join(base.eager(text.character('a'))))
                  , s
                )
            );
        });
    });
});
