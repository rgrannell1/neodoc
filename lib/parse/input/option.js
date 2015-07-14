'use strict';

var _ = require('lodash')
  , parse = require('bennu').parse
  , lang = require('bennu').lang
  , text = require('bennu').text
  , base = require('../base')
  , nodes = require('../nodes')
  , argument = require('./argument')
  , meta = require('../meta')
;

/**
 * Parse an option.
 *
 * @param {String} name
 * The name of the option to parse.
 *
 * @param {Boolean} argumentRequired
 * Does this option require an argument?
 *
 * @returns {Parser}
 */
var option = function(name, argumentRequired) {
    return text.string(name);
};

module.exports = option;
