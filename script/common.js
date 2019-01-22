/**
 * Created by PhpStorm.
 * User: 85210755@qq.com
 * NickName: 柏宇娜
 * Date: 2018/10/31 17:30
 */
// var root_host = 'http://t.scsj.net.cn/';
var root_host = 'http://192.168.1.186/';
var host = root_host + 'api';

function goTop(obj) {
    $(obj).animate({
        scrollTop: 0
    }, 'fast');
}

function fnReady() {
    fnReadyKeyback();//左箭头返回关闭
    fnReadyHeader();//hearder头修复
    fnReadyNav();//导航头高度
    fnReadyFooter();//footer高度
}

function fnReadyKeyback() {
    var keybacks = $api.domAll('.event-back');
    for (var i = 0; i < keybacks.length; i++) {
        // $api.attr(keybacks[i], 'tapmode', 'highlight');
        keybacks[i].onclick = function () {
            api.closeWin();
        };
    }

    api.parseTapmode();
}

var header, headerHeight = 0;

function fnReadyHeader() {
    header = $api.byId('header');
    if (header) {
        // $api.fixIos7Bar(header);
        headerHeight = $api.offset(header).h;
    }
}

var nav, navHeight = 0;

function fnReadyNav() {
    nav = $api.byId('nav');
    if (nav) {
        navHeight = $api.offset(nav).h;
    }
}

var footer, footerHeight = 0;

function fnReadyFooter() {
    footer = $api.byId('footer');
    if (footer) {
        footerHeight = $api.offset(footer).h;
    }
}

function fnReadyFrame(flag) {

    var frameName = api.winName + '_frame';
    var json = {
        name: frameName,
        url: './' + frameName + '.html',
        bounces: false,
        bgColor: '#f0f0f0',
        rect: {
            x: 0,
            y: headerHeight + navHeight,
            w: 'auto',
            h: api.winHeight - headerHeight - footerHeight - navHeight
        },
        pageParam: api.pageParam
    };
    if (flag) {
        json.bounces = true;
    }
    api.openFrame(json);
}

//打开window
function openWin() {
    var doms = $api.domAll('.open-win');
    for (var i = 0; i < doms.length; i++) {
        doms[i].onclick = function (e) {
            var data = e.currentTarget.dataset;
            var json = {
                name: data.name,
                url: data.url,
                pageParam: {}
            };
            for (var j in data) {
                if (i != 'name' && j != 'url') {
                    json.pageParam[j] = data[j];
                }
            }
            api.openWin(json);
        };
    }
}


/*
    @method ajax_get
    @param {string} url 请求地址
    @param {function} cb 请求成功回调
*/
function ajax_get(url, cb, err_callback) {
    var token = $api.getStorage('token') || false;
    token = token ? token : api.deviceId;
    api.ajax({
        url: host + url,
        method: 'get',
        timeout: 30,
        dataType: 'json',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
            "token": token
        }
    }, function (ret, err) {
        if (ret) {
            typeof cb == 'function' && cb(ret);
        } else {
            //错误处理
            if (err.statusCode == 401) {
                openLogin(false);//需要登录
            } else if (typeof err_callback == 'function') {
                err_callback(err);
            } else {
                api.hideProgress();
                var msg = err.body.msg ? err.body.msg : err.msg;
                toast(msg);
            }
        }
    });
}

/*
  @method ajax_post
  @param {string} url 请求地址
  @param {object} data 请求参数
  @param {function} cb 请求成功回调
*/
function ajax_post(url, data, cb, err_callback) {
    var token = $api.getStorage('token') || false;
    token = token ? token : api.deviceId;
    api.ajax({
        url: host + url,
        method: 'post',
        timeout: 30,
        dataType: 'json',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
            token: token
        },
        data: {
            values: data
        }
    }, function (ret, err) {
        if (ret) {
            typeof cb == 'function' && cb(ret);
        } else {
            if (err.statusCode == 401) {
                openLogin(false);//需要登录
            } else if (typeof err_callback == 'function') {
                err_callback(err);
            } else {
                api.hideProgress();
                var msg = err.body.msg ? err.body.msg : err.msg;
                toast(msg);
            }
        }
    });

}

//log方法

function log(data) {
    if (typeof data == 'object') {
        console.log(JSON.stringify(data));
        return;
    }
    console.log(data);
}

function toast(msg, time) {
    if (!time) time = 1500;
    api.toast({
        msg: msg,
        duration: time,
        location: 'middle'
    });

}

//loading

function loading() {
    api.showProgress({
        title: '玩命加载中...',
        // text: '先喝杯茶...',
        modal: true
    });
}

//处理时间戳
function timeParse(timestamp, getDate, getTime) {
    var date = new Date(parseInt(timestamp) * 1000);
    var Y = date.getFullYear() + '-';
    var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
    var D = (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) + ' ';
    var h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':';
    var m = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':';
    var s = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
    if (getTime)
        return h + m + s;
    if (getDate)
        return Y + M + D;
    return Y + M + D + h + m + s;
}

/**
 * 检查用户登录前后，页面是否需要刷新
 * @param name
 * @returns {boolean}
 */
function needRefreash(name) {
    var refreash = $api.getStorage('refreash');
    if (!refreash) return false;
    if (refreash[name] === true) {
        refreash[name] = false;
        $api.setStorage('refreash', refreash);
        return true;
    } else {
        var flag = false;
        Object.keys(refreash).forEach(function (key) {
            flag = flag || refreash[key];
        });
        if (flag === false) {
            $api.rmStorage('refreash');
        }
        return false;
    }
}

/**
 * 统一登录
 * @param  redirect  是否需要跳转转
 * @param  is_root  是否root窗口
 * @param  index
 * @param url
 * @param setter
 * @param param
 */
function openLogin(redirect, is_root, index, url, setter, param) {
    api.openWin({
        name: 'login',
        url: 'widget://html/login/login.html',
        pageParam: {
            redirect: redirect,
            is_root: is_root,
            name: index,
            url: url,
            seter: setter,
            param: param
        }
    });
}

/**
 * 返回首页 或 root窗口
 * @param index
 */
function toIndex(index) {
    if (!index) index = 0;
    api.execScript({
        name: 'root',
        script: 'home(' + index + ');'
    });
    api.closeToWin({
        name: 'root',
        animation: {
            subType: 'from_right'
        }
    });
}

/**
 * 拔打电话，联系客服
 * @param phone
 */
function callphone(phone) {
    if (api.systemType == 'android') {
        api.actionSheet({
            cancelTitle: '取消',
            destructiveTitle: '拨打电话: ' + phone,
        }, function (ret, err) {
            if (ret.buttonIndex == 1)
                api.call({
                    type: 'tel_prompt',
                    number: phone
                });
        });
        return;
    }
    api.call({
        type: 'tel_prompt',
        number: phone
    });

}

/**
 * 计算图片 上传文件名
 * @param str
 */
function getFileName(str) {
    var name = new Date().getTime();
    return name + str.substring(str.lastIndexOf("."));
}

/**
 * 检查手机号码
 * @param mobile
 * @returns {boolean}
 */
function checkMobile(mobile) {
    var pattern = /^1[3|4|5|6|7|8][0-9]{9}$/;
    return pattern.test(mobile);
}

function getBankLogo(bankName) {
    var name;
    if (bankName.indexOf("农业") > -1) {
        name = 'g_ny';
    } else if (bankName.indexOf("汉口") > -1) {
        name = 'b_hk';
    } else if (bankName.indexOf("齐商") > -1) {
        name = 'r_qs';
    } else if (bankName.indexOf("泰安") > -1) {
        name = 'r_ta';
    } else if (bankName.indexOf("枣庄") > -1) {
        name = 'b_zz';
    } else if (bankName.indexOf("中国银行") > -1) {
        name = 'r_zg';
    } else if (bankName.indexOf("上海") > -1) {
        name = 'b_sh';
    } else if (bankName.indexOf("建设") > -1) {
        name = 'b_jh';
    } else if (bankName.indexOf("光大") > -1) {
        name = 'y_gd';
    } else if (bankName.indexOf("广发") > -1) {
        name = 'r_gf';
    } else if (bankName.indexOf("广州发展") > -1) {
        name = 'r_gf';
    } else if (bankName.indexOf("兴业") > -1) {
        name = 'b_xy';
    } else if (bankName.indexOf("中信") > -1) {
        name = 'r_zx';
    } else if (bankName.indexOf("招商") > -1) {
        name = 'r_zs';
    } else if (bankName.indexOf("民生") > -1) {
        name = 'g_ms';
    } else if (bankName.indexOf("交通") > -1) {
        name = 'b_jt';
    } else if (bankName.indexOf("华夏") > -1) {
        name = 'r_hx';
    } else if (bankName.indexOf("工商") > -1) {
        name = 'r_gs';
    } else if (bankName.indexOf("平安") > -1) {
        name = 'y_pa';
    } else if (bankName.indexOf("邮政") > -1) {
        name = 'g_yz';
    } else if (bankName.indexOf("浦发") > -1) {
        name = 'b_pf';
    }

    return name + '.png';
}

function parseXML(ret) {
    var xmlDoc = null;
    //Internet Explorer
    try {
        xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
        xmlDoc.async = "false";
        xmlDoc.loadXML(ret);
    }
    catch (e) {
        //Firefox, Mozilla, Opera, etc.
        try {
            parser = new DOMParser();
            xmlDoc = parser.parseFromString(ret, "text/xml");
        }
        catch (e) {
            console.log('XML解析失败');
        }
    }
    return xmlDoc;
}