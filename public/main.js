/**
 * Created by xiayf on 15/12/4.
 */
let $ = jQuery = require('jquery');
let _ = require('bootstrap');
let __ = require('cn-bootstrap-datetimepicker');
let Highcharts = require('highcharts');
Highcharts.setOptions({ global: { useUTC: false } });

let statTitleMapper = {
    'connected_client': '客户端连接数(个)',
    'used_memory': '内存使用量(MB)',
    'cmd_ps': '每秒处理命令数(个)'
};

function genErrorAlert(xhr) {
    return '<div class="alert alert-danger error-tip" role="alert">' +
        '<strong>'+ xhr.status +'</strong> - '  + xhr.statusText + '<p>' + xhr.responseText + '</p>'
        + '</div>';
}

$(function () {
    $('#begin_datetime').datetimepicker({
        format: 'YYYY-MM-DD HH:mm:ss',
        defaultDate: new Date(Date.now() - (60 * 60 * 12 * 1000)),
        sideBySide: true
    });
    $('#end_datetime').datetimepicker({
        format: 'YYYY-MM-DD HH:mm:ss',
        defaultDate: new Date(),
        sideBySide: true
    });

    $('#submit_cmd').on('click', function ($e) {
        $e.preventDefault();

        let $cmdOutput = $('#cmd_output');
        $cmdOutput.empty();

        let cmd = $('input[name="cmd"]').val(),
            cmdParts = cmd.split(' '),
            params = '';
        cmd = cmdParts[0];
        if (cmdParts.length > 1) {
            params = cmdParts.slice(1).join(' ');
        }

        // 加loading效果
        let loadingPart = '<div class="row" id="loading_part">' +
                '<div class="loading-tip col-md-6"">' +
                '<span>正在执行命令,请耐心等待...</span>' +
                '</div></div>';
        $cmdOutput.append(loadingPart);

        let $loadingPart = $('#loading_part');

        let req = $.ajax({
            "method": "POST",
            "url": "/cmd",
            "data": {
                "cmd": cmd,
                "params": params
            },
            dataType: "text"
        });
        req.done(function (resp) {
            $loadingPart.remove();

            resp = '<pre>' + resp + '</pre>';
            $cmdOutput.html(resp);
        });
        req.fail(function(xhr) {
            $loadingPart.remove();
            $cmdOutput.append(genErrorAlert(xhr));
        });
    });

    $('#show_stat').on('click', function ($e) {
        $e.preventDefault();

        let selectedServer = [];
        $('.server input').each(function () {
            if ($(this).prop('checked')) {
                selectedServer.push($(this).val());
            }
        });

        let selectedIndex = [];
        $('.index input').each(function () {
            if ($(this).prop('checked')) {
                selectedIndex.push($(this).val());
            }
        });

        let reduceWay = $('input[name="reduce_way"]:checked').val();

        let beginDateTime = $('input[name="begin-datetime"]').val();
        let endDateTime = $('input[name="end-datetime"]').val();

        let $statGraphPart = $('.stat-graph-part');
        $statGraphPart.empty();

        if (selectedServer.length === 0 || selectedIndex.length === 0 || !beginDateTime || !endDateTime) {
            $statGraphPart.append('<div class="alert alert-danger error-tip col-md-6" role="alert">缺少必要参数!</div>');
            return;
        }

        // 一个指标一张图
        selectedIndex.forEach(function (ele) {
            // 加loading效果
            let loadingPartID = 'loading_' + ele,
                loadingPart = '<div class="row" id="'+ loadingPartID +'">' +
                    '<div class="loading-tip col-md-6"">' +
                    '<span>正在加载数据,请耐心等待...</span>' +
                    '</div></div>';

            $statGraphPart.append(loadingPart);

            let req = $.ajax({
                method: 'POST',
                url: "/stat",
                data: {
                    name: ele,
                    servers: selectedServer.join(','),
                    begin_time: beginDateTime,
                    end_time: endDateTime,
                    reduce_way: reduceWay
                },
                dataType: 'json'
            });
            req.done(function (resp) {
                //
                $('#' + loadingPartID).remove();

                let containerID = 'container_' + ele;
                $('.stat-graph-part').append('<div id=' + containerID + '></div>');

                $('#' + containerID).highcharts({
                    credits: {
                      enabled: false
                    },
                    title: {
                        text: statTitleMapper[ele]
                    },
                    xAxis: resp.xAxis ? resp.xAxis : {type: 'datetime'},
                    yAxis: resp.yAxis ? resp.yAxis : null,
                    series: resp.series
                });
            });
            req.fail(function(xhr) {
                $('#' + loadingPartID).remove();
                $('.stat-graph-part').append(genErrorAlert(xhr));
            });
        });
    });
});
