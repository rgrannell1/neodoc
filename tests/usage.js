'use strict';

var _ = require('lodash')
  , parse = require('bennu').parse
  , text = require('bennu').text
  , assert = require('assert')
  , options = require('../parsers/options')
;

/**
 * Tests confirming the correct behavior of the `Usage` block
 * parsers, i.e.:
 *
 * Usage:
 *     naval_fate ship new <name>...
 *     naval_fate ship <name> move <x> <y> [--speed=<kn>]
 *     naval_fate ship shoot <x> <y>
 *     naval_fate mine (set|remove) <x> <y> [--moored|--drifting]
 *     naval_fate -h | --help
 *     naval_fate --version
 */

describe('defaults', function() {

});
