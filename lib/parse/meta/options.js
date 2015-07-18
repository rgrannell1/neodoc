'use strict';

var _ = require('lodash')
  , parse = require('bennu').parse
  , lang = require('bennu').lang
  , text = require('bennu').text
  , base = require('../base')
  , util = require('../../util')
  , args = require('./argument')
  , option = require('./option')
;

/*
 * Parse a default block:
 *
 * [default: a b c "a b c"]
 *
 * into:
 *
 * [ 'a', 'b', 'c', 'a b c' ]
 */
var defaults = lang.between(
    text.string('[default:')
  , text.character(']')
  , parse.sequence(
        parse.many1(base.space)
      , parse.eager(lang.sepBy1(
            parse.many1(base.space)
          , parse.choice(
                parse.attempt(base.doubleQuoted)
              , parse.attempt(base.singleQuoted)
              , base.join(base.eager1(text.noneOf('] ')))
            )
        ))
    )
);

/*
 * Parse the leading flags, i.e:
 *
 * -f, --flag lorem ipsum
 * ^^^^^^^^^^
 */
var leadingFlags = parse.getParserState.chain(function(state) {
    return parse.choice(
        parse.attempt(base.cons(
            option.short
          , parse.next(
                parse.either(
                  text.string(', ')
                , text.string(' '))
              , option.long)
        ))
        .chain(_.spread(function(short, long) {
            return (
            (short.arg && long.arg && short.arg !== long.arg)
              ? parse.fail(util.mstr('\
                    Short and long arguments differ.    \n\
                    Please either use the same argument \n\
                    for both or only specify on one.    \
                '))
              : parse.of({
                    short: _.assign(short, { arg: short.arg || long.arg })
                  , long: _.assign(long,  { arg: short.arg || long.arg })
                  , arg: short.arg || long.arg
                }));
        }))
      , parse.attempt(option.short)
            .map(function(short) {
                return { short: short };
            })
      , parse.attempt(option.long)
            .map(function(long) {
                return { long: long };
            })
    )
    .chain(function(flags) {
        return parse.modifyState(function(userState) {
            return _.assign(userState || {}, {
                flagStart: state.position.index
            });
        }).chain(_.constant(parse.of(flags)));
    });
});

/*
 * Parse the description text, i.e. on of:
 * ... lorem ipsum [default: true]
 * ... some text [default: true]
 *     and more text
 *     ^ -- index must match!
 */
var description = parse.sequence(
    base.space
  , base.space
  , parse.many(base.space)
  , base.cons(parse.getParserState, parse.getState)).chain(
        _.spread(function(state, userState) {
            return (userState
                && userState.descriptionStart
                && userState.descriptionStart != state.position.index)
              ? base.fail('Description start not aligned!')
              : parse.rec(function(self) {
                    return parse.bind(
                        parse.choice(

                            // -----------------------------
                            // Try to parse defaults
                            // Note: Must be situated at EOL
                            //       or EOF.
                            // -----------------------------
                            parse.attempt(
                                parse.next(
                                    parse.many1(base.space)
                                  , lang.then(
                                        defaults
                                      , parse.either(
                                            parse.lookahead(
                                                text.match(/\n/)
                                            )
                                          , parse.eof
                                        )
                                    )
                                ).map(function(defs) {
                                    return [ '', [ defs ] ];
                                })
                            )

                            // ---------------------------------
                            // Try to parse plain text
                            // Note: This also parses new-lines
                            //       if the indentation matches.
                            // ---------------------------------
                          , parse.attempt(parse.choice(
                                parse.attempt(parse.sequence(
                                    text.match(/\n/)
                                  , text.string(_.repeat(
                                        ' '
                                      , state.position.index
                                    ))
                                  , text.match(/[^\n ]/)
                                ))
                                .map(function(s) { return ' ' + s; })
                              , parse.attempt(text.match(/[^\n]/))
                            ).map(function(desc) { return [ desc, [] ]; }))

                           // -------------------
                           // Parse final EOF/EOL
                           // -------------------
                          , parse.look(
                                parse.either(
                                    text.match(/\n/)
                                  , parse.eof
                                ).map(_.constant([]))
                            )
                        )
                      , _.spread(function(desc, defs) {
                            return (desc !== undefined
                                || defs  !== undefined
                            )
                              ? self.chain(_.spread(function(desc1, defs1) {
                                    return parse.of([
                                        desc + desc1
                                      , defs.concat(defs1)
                                    ]);
                                }))
                              : parse.of(['', []]);
                        })
                    );
                })

                // ---------------------
                // Sanitize and validate
                // ---------------------
                .chain(_.spread(function(desc, defs) {
                    return (_.contains(desc, '[default:'))
                      ? base.fail(
                            'Unparsed `[default: ...]` found. '
                          + 'Defaults should be specified at the '
                          + 'end of a line.'
                        )
                      : parse.of([
                            desc.replace(
                                _.repeat(' ', state.position.index)
                              , '')
                            , defs ]);
                }))

                .map(_.spread(function(desc, defs) {
                    return {
                        defaults: defs
                      , description: desc
                    };
                }))

                .chain(function(out) {
                    return parse.modifyState(function(userState) {
                        return _.assign(userState || {}, {
                            descriptionStart: state.position.index
                        });
                    }).chain(_.constant(parse.of(out)));
                });
        })
    )

    .map(function(desc) {
        return {
            defaults: ((desc.defaults && desc.defaults[0]) || null)
          , description: desc.description.trim()
        };
    })
;

/*
 * Parse a single option block, i.e. on of:
 *
 * -f, --flag  Some Description text
 * -f, --flag  Some Description text [default: 100]
 * -f          Some Description text
 * --flag      Some Description text [default: 100]
 * -f, --flag  Some Description text
 *             and more text. [default: 100]
 */
var line = base.$(base.cons(
    parse.getParserState
  , parse.getState
)).chain(_.spread(function(state, userState) {
    return (userState
        && userState.flagStart
        && userState.flagStart != state.position.index)
      ? base.fail(
            'Flag start not aligned! '
          + 'Expected leading white space of `'
          + (userState.flagStart)
          + '` spaces'
        )
      : base.cons(
            leadingFlags
          , description
        ).map(_.spread(function(flags, optText) {
            return {
                flags: flags
              , defaults: optText.defaults
              , description: optText.description
              , initialOffet: state.position.index
            };
        }))
    ;
}));

/*
 * Parse multiple options.
 *
 * -f, --flag  Some Description text [default: 100]
 *             which is continued here
 * -a, --all   Some Description text [default: 100]
 *
 * Note: The parser's position is artificially
 *       reset for each option block in order
 *       to ensure correct indentation (This
 *       may need addressing later).
 */
var options = parse.rec(function(self) {
    return parse.either(
        parse.attempt(line.chain(function(o) {
            return parse.choice(
                parse.next(
                    parse.many(text.match(/\n/))
                  , parse.setPosition(new parse.Position(0))
                        .chain(_.constant(self.map(function(os) {
                            return ([ o ]).concat(os);
                        })))
                )
              , parse.of([ o ])
            );
        }))
      , parse.eof.chain(_.constant(parse.of([])))
    );
});

module.exports = options;
module.exports.line = line;
module.exports.defaults = defaults;
