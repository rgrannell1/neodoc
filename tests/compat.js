'use strict';

var fs = require('fs')
  , _ = require('lodash')
  , assert = require('assert')
  , path = require('path')
  , parse = require('bennu').parse
  , text = require('bennu').text
  , lang = require('bennu').lang
  , base = require('../lib/parse/base')
  , docopt = require('../lib/docopt')
;

/*
 * Run the official docopt test suite.
 */
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
            console.log(rest);
            try {
            return { usage: usage, tests: parse.run(
                parse.eager(parse.many1(
                    parse.either(
                        parse.attempt(parse.next(
                            parse.many(text.space)
                          , base.cons(
                                base.join(base.cons(
                                    text.string('$ prog')
                                  , parse.eager(parse.many(text.match(/ /)))
                                  , parse.optional('', parse.attempt(
                                        base.join(parse.eager(parse.many(
                                            text.noneOf('\n'))))))
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
                                                    text.noneOf('}')))))
                                        .map(function(x) {
                                            return JSON.parse(
                                                '{' + x + '}'
                                            );
                                        })
                                    )
                                )
                            )
                        )).map(_.spread(function(input, output) {
                            return { input: input, output: output };
                        }))
                      , parse.eof)
                ))
              , rest
            ) };
            } catch(e) {
                console.log('>', rest.replace(/\n/g, ' '));
                console.log('>', _.repeat(' ', 12) + _.repeat('^', 3));
                console.log(e.toString());
                throw e;
            }
        }))
        .take(1)
        .value();

    _.each(suites, function(suite, i) {
        describe('docopt test # ' + (i + 1), function() {
            _.each(suite.tests, function(test) {
                it('`' + test.input
                 + '` should yield `' + JSON.stringify(test.output) + '`'
                  , function() {
                        var meta = docopt.parse(suite.usage)
                          , parser = docopt.generate(meta)
                        ;

                        assert(_.isEqual(
                            docopt.run(parser, test.input)
                          , test.output
                        ));
                    }
                );
            });
        });
    });
});
