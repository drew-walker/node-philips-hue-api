module.exports = require('./index_module.js')(
    require('request'),
    require('url'),
    require('q'),
    console
);