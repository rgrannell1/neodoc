'use strict';

var _ = require('lodash')
  , parse = require('bennu').parse
  , lang = require('bennu').lang
  , text = require('bennu').text
  , base = require('../base')
  , argument = require('./argument')
  , modifiers = require('./modifiers')
  , nodes = require('../nodes')
;

/**
 * Parse arguments separated by 0 or more vertical bars.
 * Each vertical bar `|` denotes a mutually exclusive set
 * of options on each side.
 *
 * The top-level list of arguments specified in a `usage`
 * line is  nothing further than another group itself, but
 * lacking the surrounding brackets or parenthesis.
 */
var group = parse.rec(function(self) {
    return parse.eager(lang.sepBy(
        base.$(text.character('|'))
      , parse.eager(parse.many1(base.$(parse.choice(
            parse.attempt(argument)
          , modifiers.maybeRepeated(parse.attempt(lang.between(
                text.character('(')
              , text.character(')')
              , self
            ).map(function(xs) {
                return {
                    type:     nodes.TYPE.GROUP
                  , required: true
                  , nodes:    xs
                };
            })))
          , modifiers.maybeRepeated(parse.attempt(lang.between(
                text.character('[')
              , text.character(']')
              , self
            ).map(function(xs) {
                return {
                    type:     nodes.TYPE.GROUP
                  , required: false
                  , nodes:    xs
                };
            })))
        ))))
    ));
});

/**
 * Parse a single usage line.
 */
var line = function(program) {
    return parse.next(
        text.string(program)
      , group
    );
};

/**
 * Parse a program name
 */
var program = parse.choice(
    parse.attempt(base.singleQuoted)
  , parse.attempt(base.doubleQuoted)
  , base.join(parse.eager(parse.many(text.match(/[a-z.\-]/))))
);

/**
 * Parse a complete usage block.
 * This can take one of the following shapes:
 *
 * Usage: program foo
 *        program foo bar
 *        program foo bar qux
 *
 * Usage: program foo
 *    or: program foo bar
 *    or: program foo bar qux
 *
 * Usage:
 *   program foo bar
 *   program foo bar
 *   program foo bar qux
 *
 * Note that the style must be consistent!
 * XXX: Should this enforced consistency be a compile flag? (pedantic)
 */
var usage = parse.sequence(
    base.string('Usage:')
  , parse.many(base.space)
  , parse.getParserState
).chain(function(state) {
    return base.$(program).chain(function(program) {
        return base.$(base.cons(

            // Parse the rest of first usage line
            //
            // Usage: program foo
            //        ^^^^^^^^^^^
            //        program bar
            group

            // Parse 0 or more usage neighbouring lines.
            // Note, that usage lines MUST be aligned on
            // the `program`.
          , parse.rec(function(self) {
                return parse.choice(

                    // Try to parse the next,
                    // correctly indented usage line:
                    //
                    // Usage: program foo
                    //        program bar
                    //        ^^^^^^^^^^^
                    parse.attempt(parse.next(
                        text.character('\n')
                      , parse.next(
                            lang.times(
                                state.position.index
                              , base.space)
                          , line(program))))
                                .chain(function(line) {
                                    return self.map(function(lines) {
                                        return [ line ].concat(lines);
                                    });
                                })

                    // Otherwise, parse a single empty line.
                    // This marks the end of the usage block.
                    //
                    // Usage: program foo
                    //        program foo
                    //
                    // ^^^^^^^^^^^^^^^^^^
                    // ...
                  , parse.attempt(parse.next(
                        text.character('\n')
                      , base.$(text.character('\n'))
                    ))
                        .map(_.constant([]))

                    // Otherwise, parse the EOF
                  , parse.eof
                        .map(_.constant([]))
                );
            })
        ));
    });
});

module.exports = usage;
module.exports.line = line;
module.exports.group = group;
