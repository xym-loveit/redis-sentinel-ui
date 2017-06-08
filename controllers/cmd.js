/**
 * @file: cmd
 * @author: youngsterxyf, gejiawen
 * @date: 15/12/5 18:00
 * @description: cmd
 */

'use strict';

let Redis = require('ioredis');
let ValidRedisCMDs = require('ioredis/commands');

let cmdRespParser = require('../utils/cmdRespParser');
let config = require('../config');

// 检测 命令 是否有效
function isValidCommand(cmd) {
    cmd = cmd.toLowerCase();
    return !!(cmd in ValidRedisCMDs);
}

/**
 *
 * @param req
 * @param res
 * @private
 */

function cmd(req, res) {
    /**
     * 请求参数:
     * 1. cmd: 大写的Redis命令
     * 2. params: 命令参数, 多个参数以空格分隔
     */
    let cmd = req.body.cmd.toUpperCase();
    if (!cmd || !isValidCommand(cmd)) {
        res.toResponse('参数cmd不合法!', 400);
        return;
    }
    let params = req.body.params;
    if (params === undefined) {
        res.toResponse('缺少必要的请求参数!', 400);
        return;
    }
    params = params.split(' ');

    let RedisServer = new Redis({
        sentinels: config.sentinels,
        name: config.master_name,
        password: config.auth
    });

    RedisServer[cmd.toLocaleLowerCase()].apply(RedisServer, params).then(function(result) {
        if (cmd === 'INFO') {
            result = cmdRespParser.infoRespParser(result.split('\r\n'));
        }
        RedisServer.disconnect();

        res.toResponse(JSON.stringify(result, null, " "));
    }, function(err) {
        res.toResponse(JSON.stringify(err, null, " "));
    });
}

/**
 * Module Exports
 */
module.exports = cmd;
