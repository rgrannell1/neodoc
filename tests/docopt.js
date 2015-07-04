'use strict';

var _ = require('lodash')
  , parse = require('bennu').parse
  , text = require('bennu').text
  , assert = require('assert')
  , usage = require('../parsers/usage')
  , docopt = require('../parsers/docopt')
;

describe('docopt', function() {
    describe('naval_fate ship <name> move <x> <y> [--speed=<kn>]', function() {
        it('should generate a valid parser', function() {
            var p = docopt.generate(
                parse.run(
                    usage.line('naval_fate')
                  , 'naval_fate ship <name> move <x> <y> [--speed=<kn>]'
                )
            );

            try{
            parse.run(
                p
              , 'naval_fate ship "foo" move 10 10 --speed=100'
            );
            } catch(e) {
                console.log(e.toString());
                throw e;
            }
        });
    });
});
