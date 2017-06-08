'use strict';

let ValidRedisCMDs = require('ioredis/commands');

let Template = require('../utils/template');

function _cmd_page(req, res) {
    res.write(Template.render('views/cmd.pug', {
        cmdList: Object.getOwnPropertyNames(ValidRedisCMDs)
    }));
    res.end();
}

module.exports = _cmd_page;
