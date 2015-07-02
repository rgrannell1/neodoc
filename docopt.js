'use strict';

var _ = require('lodash');

var str = function() {
    return _.map(_.toArray(arguments), _.method('trimRight')).join('\n');
};

var dedent = function(str) {
    var match = str.match(/^[ \t]*(?=\S)/gm);

    if (!match) {
        return str;
    }

    var indent = Math.min.apply(Math, match.map(function (el) {
        return el.length;
    }));

    var re = new RegExp('^[ \\t]{' + indent + '}', 'gm');

    return  indent > 0 ? str.replace(re, '') : str;
};

var mstr = function(str) {
    return dedent(str).replace(/[ \\t]*$/gm, '');
};

module.exports.str = str;
module.exports.mstr = mstr;
module.exports.dedent = dedent;
