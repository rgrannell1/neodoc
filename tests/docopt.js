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
                [parse.run(
                    usage.line('naval_fate')
                  , 'naval_fate ship <name> move <x> <y> --speed=<kn> --foo --bar'
                )]
            );

            try{
            var x = parse.run(
                p
              , 'ship "foo" move 10 10 --bar --speed=100 --foo="cool" --speed=200 '
            );
            } catch(e) {
                console.log(e.toString());
                throw e;
            }

            console.log(x);
        });
    });
});
