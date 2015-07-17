'use strict';

var fs = require('fs')
  , _ = require('lodash')
  , path = require('path')
  , parse = require('bennu').parse
  , text = require('bennu').text
  , lang = require('bennu').lang
  , base = require('../lib/parse/base')
;

describe('docopt.js', function() {
    var suites = _(fs.readFileSync(
        path.resolve(
            __dirname, 'fixtures', 'testcases.docopt'
        ))
        .toString('utf-8')
        .split('r"""'))
        .map(_.method('split', '"""'))
        .filter('0')
        .map(_.spread(function(usage, rest) {
            try {
            return { usage: usage, tests: parse.run(
                parse.eager(parse.many(
                    parse.either(
                        parse.attempt(parse.next(
                            parse.many(text.space)
                          , base.cons(
                                base.join(base.cons(
                                    text.string('$ prog')
                                  , parse.eager(parse.many(text.space))
                                  , base.join(parse.eager(parse.many(
                                        text.noneOf('\n'))))
                                ))
                              , parse.either(
                                    parse.attempt(parse.next(
                                        parse.many(text.space)
                                      , text.string('"user-error"')))
                                  , parse.next(
                                        parse.many(text.space)
                                      , lang.between(
                                            text.string('{')
                                          , text.string('}')
                                          , base.join(
                                                parse.eager(parse.many(
                                                    text.noneOf('}'))))))
                                        .map(function(x) {
                                            return JSON.parse('{' + x + '}');
                                        })
                                )
                            )
                        )).map(_.spread(function(cmd, output) {
                            return { cmd: cmd, output: output };
                        }))
                      , parse.eof)
                ))
              , rest
            ) };
            } catch(e) {
                console.log(e.toString());
                throw e;
            }
        }))
        .value();

    _.each(suites, function(suite, i) {
        describe('docopt test # ' + i, function() {
            _.each(suite.tests, function(test) {
                it('`' + test.cmd
                 + '` should yield `' + JSON.stringify(test.output) + '`'
                 , function() {
                });
            });
        });
    });
});
