'use strict';

var _ = require('lodash')
  , parse = require('bennu').parse
  , lang = require('bennu').lang
  , text = require('bennu').text
  , base = require('./base')
  , args = require('./args')
;

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

var option = base.$(parse.getParserState.chain(function(initialState) {
    return base.transform(
        base.cons(

            // -----------------------
            // Parse the leading flags:
            // -f, --flag [...]
            // -----------------------
            base.transform(
                parse.choice(
                    parse.attempt(base.cons(
                        args.shortOptionSingle
                      , parse.optional(
                            parse.next(
                                text.string(', ')
                              , args.longOption
                            )
                        )
                    ))
                  , parse.attempt(args.shortOptionSingle)
                  , parse.attempt(args.longOption)
                )
              , function(x) { return _.isArray(x) ? x : [ x ]; }
            )

            // -----------------------------------------------
            // Parse the description text, including defaults:
            //
            // ... lorem ipsum [default: true]
            //
            // Note that the description text may span multiple
            // lines if the the next line starts exactly the first
            // line's description text started:
            //
            // ... lorem ipsum     [default: true]
            //     brot und spiele
            // -----------------------------------------------
          , parse.sequence(
                base.space
              , base.space
              , parse.getParserState.chain(function(descState) {
                    return base.transform(
                        parse.rec(function(self) {
                            return parse.bind(
                                parse.choice(

                                    // -----------------------------
                                    // Try to parse defaults
                                    // Note: Must be situated at EOL
                                    // -----------------------------
                                    parse.attempt(base.transform(
                                        parse.next(
                                            parse.many1(base.space)
                                          , lang.then(
                                                defaults
                                              , parse.either(
                                                    text.match(/\n/)
                                                  , parse.eof
                                                )
                                            )
                                        )
                                      , function(defs) {
                                            return [ ' ', [ defs ] ];
                                        }
                                    ))

                                    // --------------------------------
                                    // Try to parse plain text
                                    // Note: This also parses new-lines
                                    //       if the indentation matches
                                    // --------------------------------
                                  , parse.attempt(base.transform(
                                        parse.choice(
                                            base.transform(
                                                parse.attempt(parse.sequence(
                                                    text.match(/\n/)
                                                  , text.string(_.repeat(
                                                        ' '
                                                      , descState.position.index
                                                ))))
                                              , function(s) { return s + ' '; }
                                            )
                                          , parse.attempt(parse.anyToken)
                                        )
                                      , function(desc) {
                                            return [ desc, [] ];
                                        }
                                    ))

                                   // -------------------
                                   // Parse final EOF/EOL
                                   // -------------------
                                  , base.transform(
                                        parse.either(
                                            parse.eof
                                          , text.match(/\n/)
                                        )
                                      , _.constant([])
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
                        // -------------------------------
                        // Sanitize the description string
                        // -------------------------------
                        .chain(_.spread(function(desc, defs) {
                            return (_.contains(desc, '[default:'))
                              ? base.fail(
                                    'Unparsed `[default: ...]` found. '
                                  + 'Defaults should be specified at the '
                                  + 'end of a line.'
                                )
                              : parse.of([
                                    desc.replace(
                                        _.repeat(' ', descState.position.index)
                                      , '')
                                    , defs ]);
                        }))
                      , _.spread(function(desc, defs) {
                            return {
                                description: desc
                              , defaults:    defs
                            };
                        })
                    );
                })
            )
        )
      , _.spread(function(flags, optText) {
            return {
                flags:        flags
              , defaults:     ((optText.defaults && optText.defaults[0]) || null)
              , description:  optText.description.trim()
              , initialOffet: initialState.position.index
            };
        })
    );
}));

var options = parse.rec(function(self) {
});

module.exports.defaults = defaults;
module.exports.option = option;
module.exports.options = options;
