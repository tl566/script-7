/*
tgchannel：https://t.me/Ariszy8028
github：https://github.com/Ariszy/Private-Script
boxjs：https://raw.githubusercontent.com/Ariszy/Private-Script/master/Ariszy.boxjs.json

[task_local]
#手机竞猜
0 0 * * * https://raw.githubusercontent.com/Ariszy/Private-Script/master/JD/zy_sjjc.js, tag= 手机竞猜
================Loon==============
[Script]
cron "0 0 * * *" script-path= https://raw.githubusercontent.com/Ariszy/Private-Script/master/JD/zy_sjjc.js,tag= 手机竞猜
===============Surge=================
手机竞猜 = type=cron,cronexp="0 0 * * *",wake-system=1,timeout=3600,script-path= https://raw.githubusercontent.com/Ariszy/Private-Script/master/JD/zy_sjjc.js
============小火箭=========
sjjc = type=cron,script-path= https://raw.githubusercontent.com/Ariszy/Private-Script/master/JD/zy_sjjc.js, cronexpr="0 0 * * *", timeout=3600, enable=true
*/
const Ariszy = '手机竞猜'
const $ = Env(Ariszy)
const notify = $.isNode() ?require('./sendNotify') : '';
/*
 *Progcessed By JSDec in 1.22s
 *JSDec - JSDec.js.org
 */
cookiesArr = [];
CodeArr = [];
cookie = '';
var brandlistArr = [],
    shareidArr = [];
const jdCookieNode = $['isNode']() ? require('./jdCookie.js') : '';
cookiesArr = [$['getdata']('CookieJD'), $['getdata']('CookieJD2'), ...jsonParse($['getdata']('CookiesJD') || '[]')['map'](_0x260b65 => _0x260b65['cookie'])]['filter'](_0x1a9415 => !!_0x1a9415);
let tz = $['getval']('tz') || '1';
const invite = 0x1;
const logs = 0x0;
var hour = '';
var minute = '';
if ($['isNode']()) {
    hour = new Date(new Date()['getTime']() + 0x8 * 0x3c * 0x3c * 0x3e8)['getHours']();
    minute = new Date(new Date()['getTime']() + 0x8 * 0x3c * 0x3c * 0x3e8)['getMinutes']();
} else {
    hour = new Date()['getHours']();
    minute = new Date()['getMinutes']();
}
if ($['isNode']()) {
    Object['keys'](jdCookieNode)['forEach'](_0x13be82 => {
        cookiesArr['push'](jdCookieNode[_0x13be82]);
    });
    if (process['env']['JD_DEBUG'] && process['env']['JD_DEBUG'] === 'false') console['log'] = () => {};
} else {
    cookiesArr = [$['getdata']('CookieJD'), $['getdata']('CookieJD2'), ...$['toObj']($['getdata']('CookiesJD') || '[]')['map'](_0x2bfe98 => _0x2bfe98['cookie'])]['filter'](_0x3c241f => !!_0x3c241f);
}!(async () => {
    var _0x19639c = {
        'EMYak': 'CookieJD2',
        'HXDFf': 'CookiesJD',
        'WjlSD': '【提示】请先获取cookie\x0a直接使用NobyDa的京东签到获取',
        'UGoPz': 'https://bean.m.jd.com/bean/signIndex.action',
        'klrGm': function(_0x555417, _0x2c5e25) {
            return _0x555417 < _0x2c5e25;
        },
        'zEeCL': function(_0x3149ed, _0x563628) {
            return _0x3149ed + _0x563628;
        },
        'KzbqS': function(_0xc56497, _0x101583) {
            return _0xc56497 !== _0x101583;
        },
        'JuKEq': 'nGtKA',
        'UmAIh': function(_0x2b83b6) {
            return _0x2b83b6();
        },
        'noCmC': function(_0x3df260) {
            return _0x3df260();
        },
        'YdETy': 'cnaYl',
        'reELC': 'HEgwt',
        'PupWr': '0|5|7|3|1|6|4|2',
        'hncbS': function(_0x297064) {
            return _0x297064();
        },
        'mBYYP': function(_0xd730e2, _0x3961b2) {
            return _0xd730e2(_0x3961b2);
        }
    };
    if (!cookiesArr[0x0]) {
        $['msg']($['name'], _0x19639c['WjlSD'], _0x19639c['UGoPz'], {
            'open-url': _0x19639c['UGoPz']
        });
        return;
    }
    await control();
    for (let _0x2f2d8d = 0x0; _0x19639c['klrGm'](_0x2f2d8d, cookiesArr['length']); _0x2f2d8d++) {
        cookie = cookiesArr[_0x2f2d8d];
        $['UserName'] = decodeURIComponent(cookie['match'](/pt_pin=([^; ]+)(?=;?)/) && cookie['match'](/pt_pin=([^; ]+)(?=;?)/)[0x1]);
        message = '';
        $['isLogin'] = !![];
        $['index'] = _0x19639c['zEeCL'](_0x2f2d8d, 0x1);
        console['log']('\n******开始【京东账号' + $['index'] + '】' + ($['nickName'] || $['UserName']) + '*********\x0a');
        if (!$['isLogin']) {
            $['msg']($['name'], '【提示】cookie已失效', '京东账号' + $['index'] + ' ' + ($['nickName'] || $['UserName']) + '\n请重新登录获取\nhttps://bean.m.jd.com/bean/signIndex.action', {
                'open-url': _0x19639c['UGoPz']
            });
            if ($['isNode']()) {
                if (_0x19639c['KzbqS'](_0x19639c['JuKEq'], _0x19639c['JuKEq'])) {
                    $['log'](message);
                } else {
                    await notify['sendNotify']($['name'] + 'cookie已失效 - ' + $['UserName'], '京东账号' + $['index'] + ' ' + $['UserName'] + '\n请重新登录获取cookie');
                }
            }
            continue;
        }
        await _0x19639c['UmAIh'](getlist);
        await _0x19639c['noCmC'](quiz);
        await _0x19639c['noCmC'](Zy);
    }
    for (let _0x40a640 = 0x0; _0x19639c['klrGm'](_0x40a640, cookiesArr['length']); _0x40a640++) {
        if (_0x19639c['KzbqS'](_0x19639c['YdETy'], _0x19639c['reELC'])) {
            var _0x436921 = _0x19639c['PupWr']['split']('|'),
                _0x1f571a = 0x0;
            while (!![]) {
                switch (_0x436921[_0x1f571a++]) {
                    case '0':
                        cookie = cookiesArr[_0x40a640];
                        continue;
                    case '1':
                        $['index'] = _0x40a640 + 0x1;
                        continue;
                    case '2':
                        await _0x19639c['hncbS'](formatcode);
                        continue;
                    case '3':
                        $['isLogin'] = !![];
                        continue;
                    case '4':
                        await zy();
                        continue;
                    case '5':
                        $['UserName'] = _0x19639c['mBYYP'](decodeURIComponent, cookie['match'](/pt_pin=([^; ]+)(?=;?)/) && cookie['match'](/pt_pin=([^; ]+)(?=;?)/)[0x1]);
                        continue;
                    case '6':
                        console['log']('\n******开始【京东账号' + $['index'] + '】' + ($['nickName'] || $['UserName']) + '助力模块*********\n');
                        continue;
                    case '7':
                        message = '';
                        continue;
                }
                break;
            }
        } else {
            cookiesArr = [$['getdata']('CookieJD'), $['getdata'](_0x19639c['EMYak']), ...$['toObj']($['getdata'](_0x19639c['HXDFf']) || '[]')['map'](_0x5e966c => _0x5e966c['cookie'])]['filter'](_0x135a22 => !!_0x135a22);
        }
    }
})()['catch'](_0x426df6 => $['logErr'](_0x426df6))['finally'](() => $['done']());

function PostRequest(_0x2a28d2, _0x1211b1) {
    var _0x109ba0 = {
        'pCjmM': 'application/json, text/plain, */*',
        'zVDTt': 'gzip, deflate, br',
        'HTbuP': 'application/x-www-form-urlencoded',
        'fjHWB': 'api.m.jd.com',
        'KuRHn': 'jdapp;iPhone;10.2.2;14.4;0bcbcdb2a68f16cf9c9ad7c9b944fd141646a849;M/5.0;network/wifi;ADID/;model/iPhone12,1;addressid/2377723269;appBuild/167863;jdSupportDarkMode/0;Mozilla/5.0 (iPhone; CPU iPhone OS 14_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1;'
    };
    const _0x1cd509 = 'https://api.m.jd.com/api/' + _0x2a28d2;
    const _0x55f0ea = 'POST';
    const _0x18458f = {
        'Accept': _0x109ba0['pCjmM'],
        'Accept-Encoding': _0x109ba0['zVDTt'],
        'Accept-Language': 'zh-cn',
        'Connection': 'keep-alive',
        'Content-Type': _0x109ba0['HTbuP'],
        'Cookie': cookie,
        'Host': _0x109ba0['fjHWB'],
        'Origin': 'https://electricsuper.jd.com',
        'Referer': 'https://electricsuper.jd.com/?lng=121.406936&lat=31.363832&sid=8610c0280494250aa210ed252f7ad28w&un_area=13_1016_47166_57860',
        'User-Agent': _0x109ba0['KuRHn']
    };
    return {
        'url': _0x1cd509,
        'method': _0x55f0ea,
        'headers': _0x18458f,
        'body': _0x1211b1
    };
}

function PostRequests(_0x157b53) {
    var _0x57ed76 = {
        'WdTXC': 'application/json, text/plain, */*',
        'WyvAP': 'keep-alive',
        'gzSPY': 'application/x-www-form-urlencoded'
    };
    const _0x178bf2 = 'https://api.m.jd.com/api';
    const _0x4c1677 = 'POST';
    const _0x316444 = {
        'Accept': _0x57ed76['WdTXC'],
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'zh-cn',
        'Connection': _0x57ed76['WyvAP'],
        'Content-Type': _0x57ed76['gzSPY'],
        'Cookie': cookie,
        'Host': 'api.m.jd.com',
        'Origin': 'https://electricsuper.jd.com',
        'Referer': 'https://electricsuper.jd.com/?lng=121.406936&lat=31.363832&sid=8610c0280494250aa210ed252f7ad28w&un_area=13_1016_47166_57860',
        'User-Agent': 'jdapp;iPhone;10.2.2;14.4;0bcbcdb2a68f16cf9c9ad7c9b944fd141646a849;M/5.0;network/wifi;ADID/;model/iPhone12,1;addressid/2377723269;appBuild/167863;jdSupportDarkMode/0;Mozilla/5.0 (iPhone; CPU iPhone OS 14_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1;'
    };
    return {
        'url': _0x178bf2,
        'method': _0x4c1677,
        'headers': _0x316444,
        'body': _0x157b53
    };
}

function GetRequest(_0x982bdb) {
    var _0x576bc3 = {
        'cBWDj': 'application/json, text/plain, */*',
        'zqcoO': 'keep-alive'
    };
    const _0x433060 = 'https://brandquiz.m.jd.com/api/' + _0x982bdb;
    const _0x54ab7e = 'GET';
    const _0xb14f10 = {
        'Accept': _0x576bc3['cBWDj'],
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'zh-cn',
        'Connection': _0x576bc3['zqcoO'],
        'Cookie': cookie,
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148'
    };
    return {
        'url': _0x433060,
        'method': _0x54ab7e,
        'headers': _0xb14f10
    };
}
async function quiz() {
    var _0x2a2c3c = {
        'UMwfG': 'zh-cn',
        'NPcbs': function(_0x3331a2, _0x18474e) {
            return _0x3331a2 === _0x18474e;
        },
        'mgBaw': 'KaIas',
        'JFISk': 'dSldG',
        'FYzsN': function(_0x3404d0, _0x488755) {
            return _0x3404d0 + _0x488755;
        },
        'UOkrp': function(_0x3fa95f, _0x292a14) {
            return _0x3fa95f + _0x292a14;
        },
        'QzJte': '豆豆\n开奖时间为:',
        'Rtway': function(_0x4db155, _0x4e236d) {
            return _0x4db155 !== _0x4e236d;
        },
        'uZknx': function(_0x8ae275) {
            return _0x8ae275();
        },
        'llNvO': 'fsbql',
        'xQMwf': function(_0x204a48, _0x524d9a) {
            return _0x204a48(_0x524d9a);
        },
        'RuSNN': function(_0x357283, _0x1d5e20, _0x137aba) {
            return _0x357283(_0x1d5e20, _0x137aba);
        }
    };
    const _0x81881c = 'appid=apple-jd-aggregate&functionId=brandquiz_prod&body={\"quizId\":3,\"quizStr\":\"' + _0x2a2c3c['xQMwf'](distinct, brandlistArr) + '\",\"predictId\":null,\"apiMapping\":\"/api/index/quiz\"}&t=1635840868162&loginType=2';
    const _0x1f7d9c = _0x2a2c3c['RuSNN'](PostRequest, 'index/quiz', _0x81881c);
    return new Promise(_0x54b8c2 => {
        var _0x1b98b2 = {
            'ksfiW': '😫助力失败,已经助力过了\n',
            'WHCpU': _0x2a2c3c['UMwfG'],
            'prVZZ': 'jdapp;iPhone;10.2.2;14.4;0bcbcdb2a68f16cf9c9ad7c9b944fd141646a849;M/5.0;network/wifi;ADID/;model/iPhone12,1;addressid/2377723269;appBuild/167863;jdSupportDarkMode/0;Mozilla/5.0 (iPhone; CPU iPhone OS 14_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1;',
            'pYjhg': function(_0x1e71d8, _0x2cc99e) {
                return _0x2a2c3c['NPcbs'](_0x1e71d8, _0x2cc99e);
            },
            'jFQIj': _0x2a2c3c['mgBaw'],
            'drOIv': 'gOOLr',
            'XDgLR': function(_0x4c334b, _0xb6547b) {
                return _0x4c334b == _0xb6547b;
            },
            'BiERn': _0x2a2c3c['JFISk'],
            'DNnyk': function(_0x25db34, _0x533fe7) {
                return _0x2a2c3c['FYzsN'](_0x25db34, _0x533fe7);
            },
            'VSxWL': function(_0x32dab1, _0x4a279c) {
                return _0x2a2c3c['FYzsN'](_0x32dab1, _0x4a279c);
            },
            'IstNd': function(_0x57ea06, _0x396b1f) {
                return _0x2a2c3c['UOkrp'](_0x57ea06, _0x396b1f);
            },
            'dxzlv': function(_0x2f648f, _0x4e1f9c) {
                return _0x2f648f + _0x4e1f9c;
            },
            'YaQwj': _0x2a2c3c['QzJte'],
            'XmyMP': function(_0x390e8c, _0x4d685d) {
                return _0x2a2c3c['Rtway'](_0x390e8c, _0x4d685d);
            },
            'USixR': 'sfLHO',
            'dzrlS': function(_0x39bc32) {
                return _0x2a2c3c['uZknx'](_0x39bc32);
            }
        };
        if (_0x2a2c3c['llNvO'] !== _0x2a2c3c['llNvO']) {
            $['log'](_0x1b98b2['ksfiW']);
        } else {
            $['post'](_0x1f7d9c, async (_0x110bf6, _0x3cdf0c, _0x40c73f) => {
                var _0x3f7919 = {
                    'rSGpP': _0x1b98b2['WHCpU'],
                    'IWUCS': 'https://electricsuper.jd.com/?lng=121.406936&lat=31.363832&sid=8610c0280494250aa210ed252f7ad28w&un_area=13_1016_47166_57860',
                    'KFDBE': _0x1b98b2['prVZZ']
                };
                if (_0x1b98b2['pYjhg'](_0x1b98b2['jFQIj'], _0x1b98b2['drOIv'])) {
                    const _0x57c40a = 'https://api.m.jd.com/api';
                    const _0x24edc4 = 'POST';
                    const _0x51d7b9 = {
                        'Accept': 'application/json, text/plain, */*',
                        'Accept-Encoding': 'gzip, deflate, br',
                        'Accept-Language': _0x3f7919['rSGpP'],
                        'Connection': 'keep-alive',
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Cookie': cookie,
                        'Host': 'api.m.jd.com',
                        'Origin': 'https://electricsuper.jd.com',
                        'Referer': _0x3f7919['IWUCS'],
                        'User-Agent': _0x3f7919['KFDBE']
                    };
                    return {
                        'url': _0x57c40a,
                        'method': _0x24edc4,
                        'headers': _0x51d7b9,
                        'body': _0x81881c
                    };
                } else {
                    try {
                        const _0x6cfafa = JSON['parse'](_0x40c73f);
                        if (logs) $['log'](_0x40c73f);
                        if (_0x6cfafa && _0x6cfafa['code'] && _0x1b98b2['XDgLR'](_0x6cfafa['code'], 0xc8)) {
                            if (_0x1b98b2['pYjhg'](_0x1b98b2['BiERn'], 'dSldG')) {
                                console['log'](_0x1b98b2['DNnyk'](_0x1b98b2['VSxWL'](_0x1b98b2['VSxWL'](_0x1b98b2['IstNd'](_0x1b98b2['dxzlv']('\x0a竞猜成功，获得', _0x6cfafa['data']['beanNum']), _0x1b98b2['YaQwj']), _0x40c73f['match'](/\d+月\d+日/)), ' 10:00 \n下轮竞猜时间为：'), _0x6cfafa['data']['nextQuizDate']));
                                await $['wait'](0x1f40);
                            } else {
                                return Array['from'](new Set(array));
                            }
                        } else {
                            $['log'](_0x1b98b2['dxzlv'](_0x6cfafa['msg'], '\x0a'));
                        }
                    } catch (_0x323ffa) {
                        if (_0x1b98b2['XmyMP'](_0x1b98b2['USixR'], _0x1b98b2['USixR'])) {
                            for (var _0x11b96e in sharecodesArr[i]) {
                                sharecodeArr['push'](sharecodesArr[i][_0x11b96e]['Code']);
                            }
                        } else {
                            $['logErr'](_0x323ffa, _0x3cdf0c);
                        }
                    } finally {
                        _0x1b98b2['dzrlS'](_0x54b8c2);
                    }
                }
            });
        }
    });
}
async function control() {
    var _0x52f7a7 = {
        'GNxaJ': function(_0x2f16ed, _0x5db196) {
            return _0x2f16ed < _0x5db196;
        },
        'TqbIv': function(_0x438509) {
            return _0x438509();
        }
    };
    for (let _0x431fbb = 0x0; _0x52f7a7['GNxaJ'](_0x431fbb, cookiesArr['length']); _0x431fbb++) {
        cookie = cookiesArr[_0x431fbb];
        await _0x52f7a7['TqbIv'](getshareid);
    }
}
async function getshareid() {
    var _0x357c3d = {
        'aRmSi': '😫助力失败,不能助力自己\n',
        'RZJgb': '请勿随意在BoxJs输入框修改内容\n建议通过脚本去获取cookie',
        'oRpnr': function(_0x563264, _0x1aa6bb) {
            return _0x563264 === _0x1aa6bb;
        },
        'sSwli': 'NLNLn',
        'iwzAK': function(_0x46f460, _0x387833) {
            return _0x46f460 == _0x387833;
        },
        'SXNCJ': function(_0x1328d0, _0x4b21d1) {
            return _0x1328d0 + _0x4b21d1;
        },
        'YvMij': '互助码：',
        'qUHAg': 'omeaH',
        'XBbtw': 'SsGov',
        'RyHBQ': 'BXBhR',
        'uqnuf': function(_0x24ca29) {
            return _0x24ca29();
        },
        'gHUhA': function(_0x1d500b, _0x4db2e9) {
            return _0x1d500b !== _0x4db2e9;
        },
        'IcMJz': 'mmhCi',
        'NTZUg': function(_0x13cd20, _0x2846dc) {
            return _0x13cd20(_0x2846dc);
        }
    };
    const _0xae97b = 'appid=apple-jd-aggregate&functionId=brandquiz_prod&body={"quizId":3,"apiMapping":"/api/support/getSupport"}&t=' + new Date()['getTime']() + '&loginType=2';
    const _0x425e84 = _0x357c3d['NTZUg'](PostRequests, _0xae97b);
    return new Promise(_0x36a5cc => {
        var _0x4a0c9f = {
            'PKNLD': _0x357c3d['aRmSi'],
            'ZxQGm': _0x357c3d['RZJgb'],
            'YkQRH': function(_0x53b374, _0x5aedb2) {
                return _0x357c3d['oRpnr'](_0x53b374, _0x5aedb2);
            },
            'MsdbD': _0x357c3d['sSwli'],
            'VDHKy': function(_0x509862, _0x49d3e8) {
                return _0x357c3d['iwzAK'](_0x509862, _0x49d3e8);
            },
            'YcRfD': function(_0x52f5c5, _0x3d61ac) {
                return _0x357c3d['SXNCJ'](_0x52f5c5, _0x3d61ac);
            },
            'pKkma': _0x357c3d['YvMij'],
            'WiNVa': 'IsnRL',
            'fBWDg': _0x357c3d['qUHAg'],
            'NYwmd': _0x357c3d['XBbtw'],
            'oghPg': _0x357c3d['RyHBQ'],
            'zdDjY': function(_0x35074c) {
                return _0x357c3d['uqnuf'](_0x35074c);
            }
        };
        if (_0x357c3d['gHUhA']('mmhCi', _0x357c3d['IcMJz'])) {
            $['log'](_0x4a0c9f['PKNLD']);
        } else {
            $['post'](_0x425e84, async (_0x36e382, _0xff4a19, _0x47d475) => {
                try {
                    if (_0x4a0c9f['YkQRH'](_0x4a0c9f['MsdbD'], _0x4a0c9f['MsdbD'])) {
                        const _0x43f695 = JSON['parse'](_0x47d475);
                        if (logs) $['log'](_0x47d475);
                        if (_0x43f695 && _0x43f695['code'] && _0x4a0c9f['VDHKy'](_0x43f695['code'], 0xc8)) {
                            $['log'](_0x4a0c9f['YcRfD'](_0x4a0c9f['pKkma'], _0x43f695['data']['shareId']) + '\x0a');
                            shareidArr['push'](_0x43f695['data']['shareId']);
                            await $['wait'](0x1f40);
                        } else {
                            if (_0x4a0c9f['WiNVa'] !== _0x4a0c9f['fBWDg']) {
                                $['log']('😫' + _0x43f695['msg'] + '\x0a');
                            } else {
                                sharecodeArr['push'](sharecodesArr[i][j]['Code']);
                            }
                        }
                    } else {
                        console['log'](e);
                        $['msg']($['name'], '', _0x4a0c9f['ZxQGm']);
                        return [];
                    }
                } catch (_0xad72d9) {
                    $['logErr'](_0xad72d9, _0xff4a19);
                } finally {
                    if (_0x4a0c9f['NYwmd'] === _0x4a0c9f['oghPg']) {
                        _0x36a5cc();
                    } else {
                        _0x4a0c9f['zdDjY'](_0x36a5cc);
                    }
                }
            });
        }
    });
}
async function Zy() {
    brandlistArr['splice'](0x0, brandlistArr['length']);
}
async function dosupport(_0x260405) {
    var _0x186242 = {
        'FELrD': 'https://electricsuper.jd.com',
        'hvqih': function(_0x413a52, _0x3161fc) {
            return _0x413a52 == _0x3161fc;
        },
        'EeKKm': 'string',
        'WjunB': '请勿随意在BoxJs输入框修改内容\x0a建议通过脚本去获取cookie',
        'wARiz': '😫助力失败,不能助力自己\n',
        'bVDIz': function(_0x5de040, _0x3660f6) {
            return _0x5de040 === _0x3660f6;
        },
        'ptRrC': 'XtQXX',
        'dFSGM': '助力成功\n',
        'lIscX': 'oAQfX',
        'UFGPu': 'xFzRy',
        'fyxGq': '😫助力失败,已经助力过了\n',
        'LufnW': 'qkhvV',
        'TIgui': function(_0x59b036, _0x8cabdb) {
            return _0x59b036 !== _0x8cabdb;
        },
        'PKTsg': 'qOgSS',
        'AzvgL': function(_0x2d27b0) {
            return _0x2d27b0();
        },
        'RiPWW': 'pEnoj',
        'JfWuZ': 'GKBRu',
        'yPhmR': function(_0x376d05, _0x151b7f) {
            return _0x376d05(_0x151b7f);
        }
    };
    const _0x125458 = 'appid=apple-jd-aggregate&functionId=brandquiz_prod&body={"shareId":"' + _0x260405 + '","apiMapping":"/api/support/doSupport"}&t=' + new Date()['getTime']() + '&loginType=2';
    const _0x23abd9 = _0x186242['yPhmR'](PostRequests, _0x125458);
    return new Promise(_0x34fa91 => {
        var _0x220b9b = {
            'yxsZz': 'zh-cn',
            'yjRsr': _0x186242['FELrD'],
            'RmgmP': function(_0x10d1ae, _0x4a1942) {
                return _0x186242['hvqih'](_0x10d1ae, _0x4a1942);
            },
            'WhWak': _0x186242['EeKKm'],
            'fjnMk': _0x186242['WjunB'],
            'bRZCS': function(_0x8c1a4, _0x738b98) {
                return _0x8c1a4 == _0x738b98;
            },
            'mpuMu': _0x186242['wARiz'],
            'ivYPD': function(_0x574cfa, _0x2c4774) {
                return _0x186242['bVDIz'](_0x574cfa, _0x2c4774);
            },
            'WYfQd': _0x186242['ptRrC'],
            'LgaFd': _0x186242['dFSGM'],
            'aEmWz': _0x186242['lIscX'],
            'VwawM': 'DxuSl',
            'bPdix': _0x186242['UFGPu'],
            'TacrT': _0x186242['fyxGq'],
            'QPZfY': function(_0x144d32, _0x554f2d) {
                return _0x144d32 === _0x554f2d;
            },
            'CiNxS': _0x186242['LufnW'],
            'AYVQm': 'iCErf',
            'Ttghs': function(_0x3b5685, _0x19d96f) {
                return _0x186242['TIgui'](_0x3b5685, _0x19d96f);
            },
            'hnkPK': _0x186242['PKTsg'],
            'Dhvrw': function(_0x28a2a0) {
                return _0x186242['AzvgL'](_0x28a2a0);
            }
        };
        if (_0x186242['RiPWW'] === _0x186242['JfWuZ']) {
            const _0x3b6b93 = 'https://api.m.jd.com/api/' + uri;
            const _0x18047d = 'POST';
            const _0x1746bf = {
                'Accept': 'application/json, text/plain, */*',
                'Accept-Encoding': 'gzip, deflate, br',
                'Accept-Language': _0x220b9b['yxsZz'],
                'Connection': 'keep-alive',
                'Content-Type': 'application/x-www-form-urlencoded',
                'Cookie': cookie,
                'Host': 'api.m.jd.com',
                'Origin': _0x220b9b['yjRsr'],
                'Referer': 'https://electricsuper.jd.com/?lng=121.406936&lat=31.363832&sid=8610c0280494250aa210ed252f7ad28w&un_area=13_1016_47166_57860',
                'User-Agent': 'jdapp;iPhone;10.2.2;14.4;0bcbcdb2a68f16cf9c9ad7c9b944fd141646a849;M/5.0;network/wifi;ADID/;model/iPhone12,1;addressid/2377723269;appBuild/167863;jdSupportDarkMode/0;Mozilla/5.0 (iPhone; CPU iPhone OS 14_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1;'
            };
            return {
                'url': _0x3b6b93,
                'method': _0x18047d,
                'headers': _0x1746bf,
                'body': _0x125458
            };
        } else {
            $['post'](_0x23abd9, async (_0x3bf36d, _0x2e9470, _0x513949) => {
                var _0x3d5576 = {
                    'YXUas': function(_0x108382, _0x4988a6) {
                        return _0x108382 == _0x4988a6;
                    },
                    'wmVAF': function(_0x1a679e, _0x21f39d) {
                        return _0x220b9b['bRZCS'](_0x1a679e, _0x21f39d);
                    },
                    'mGnVj': _0x220b9b['mpuMu'],
                    'APwdJ': function(_0x2297fc, _0xec2dc0) {
                        return _0x220b9b['bRZCS'](_0x2297fc, _0xec2dc0);
                    },
                    'IfcDd': '😫助力失败,已经助力过了\x0a'
                };
                try {
                    const _0x34ef79 = JSON['parse'](_0x513949);
                    $['log'](_0x513949);
                    if (_0x34ef79 && _0x34ef79['code'] && _0x220b9b['bRZCS'](_0x34ef79['code'], 0xc8) && _0x220b9b['bRZCS'](_0x34ef79['data'], 0x7)) {
                        if (_0x220b9b['ivYPD'](_0x220b9b['WYfQd'], _0x220b9b['WYfQd'])) {
                            console['log'](_0x220b9b['LgaFd']);
                        } else {
                            return JSON['parse'](str);
                        }
                    } else if (_0x34ef79['data'] == 0x1) {
                        if (_0x220b9b['aEmWz'] === _0x220b9b['VwawM']) {
                            $['logErr'](e, _0x2e9470);
                        } else {
                            $['log'](_0x220b9b['mpuMu']);
                        }
                    } else if (_0x220b9b['bRZCS'](_0x34ef79['data'], 0x3)) {
                        if ('vUlFe' !== _0x220b9b['bPdix']) {
                            $['log'](_0x220b9b['TacrT']);
                        } else {
                            const _0x175b5c = JSON['parse'](_0x513949);
                            $['log'](_0x513949);
                            if (_0x175b5c && _0x175b5c['code'] && _0x175b5c['code'] == 0xc8 && _0x3d5576['YXUas'](_0x175b5c['data'], 0x7)) {
                                console['log']('助力成功\n');
                            } else if (_0x3d5576['wmVAF'](_0x175b5c['data'], 0x1)) {
                                $['log'](_0x3d5576['mGnVj']);
                            } else if (_0x3d5576['APwdJ'](_0x175b5c['data'], 0x3)) {
                                $['log'](_0x3d5576['IfcDd']);
                            }
                        }
                    }
                } catch (_0x5b7f2d) {
                    if (_0x220b9b['QPZfY'](_0x220b9b['CiNxS'], _0x220b9b['AYVQm'])) {
                        if (_0x220b9b['RmgmP'](typeof str, _0x220b9b['WhWak'])) {
                            try {
                                return JSON['parse'](str);
                            } catch (_0xecfb22) {
                                console['log'](_0xecfb22);
                                $['msg']($['name'], '', _0x220b9b['fjnMk']);
                                return [];
                            }
                        }
                    } else {
                        $['logErr'](_0x5b7f2d, _0x2e9470);
                    }
                } finally {
                    if (_0x220b9b['Ttghs']('qOgSS', _0x220b9b['hnkPK'])) {
                        $['logErr'](e, _0x2e9470);
                    } else {
                        _0x220b9b['Dhvrw'](_0x34fa91);
                    }
                }
            });
        }
    });
}
async function zy() {
    var _0x1b3e4b = {
        'Qtnev': function(_0x166f7e, _0x218c3b) {
            return _0x166f7e < _0x218c3b;
        },
        'UOvEx': function(_0x2ffcf2, _0x2b6119) {
            return _0x2ffcf2(_0x2b6119);
        },
        'cXcgk': function(_0x3e08e9, _0x589f6b) {
            return _0x3e08e9 + _0x589f6b;
        },
        'ReQYO': function(_0x505ec5, _0x14a451) {
            return _0x505ec5 + _0x14a451;
        }
    };
    for (let _0x21401c = 0x0; _0x1b3e4b['Qtnev'](_0x21401c, _0x1b3e4b['UOvEx'](distinct, shareidArr)['length']); _0x21401c++) {
        console['log'](_0x1b3e4b['cXcgk'](_0x1b3e4b['ReQYO']('开始内部助力', shareidArr[_0x21401c]), '\x0a'));
        await dosupport(shareidArr[_0x21401c]);
        await $['wait'](0x1f40);
    }
}
async function getlist() {
    var _0x1a0ab1 = {
        'WQCkG': function(_0x25fc47) {
            return _0x25fc47();
        },
        'lnbkT': function(_0x4ec528, _0x3f2a73) {
            return _0x4ec528 + _0x3f2a73;
        },
        'zyKcm': function(_0x2c7e7b, _0x2ae0da) {
            return _0x2c7e7b * _0x2ae0da;
        },
        'EDTuL': function(_0x22bbd1, _0x2583f1) {
            return _0x22bbd1 === _0x2583f1;
        },
        'ShfQq': 'dUBbt',
        'orrwx': function(_0x9f7f44, _0x3b3423) {
            return _0x9f7f44 !== _0x3b3423;
        },
        'YuAYJ': 'LBZrf',
        'eAoey': '榜单获取成功',
        'xcwwJ': function(_0x5a4e57, _0x4c0f6d) {
            return _0x5a4e57(_0x4c0f6d);
        },
        'byXXY': function(_0x59c585, _0x4a4ccf) {
            return _0x59c585 === _0x4a4ccf;
        },
        'IQuts': 'cdiAg',
        'RzdVl': function(_0x59fb26, _0x30537e) {
            return _0x59fb26 === _0x30537e;
        },
        'RmYnm': 'rkFvv',
        'kPUAW': function(_0x30b3a1, _0x3ffc08) {
            return _0x30b3a1(_0x3ffc08);
        }
    };
    const _0x15ce2e = 'appid=apple-jd-aggregate&functionId=brandquiz_prod&body={"apiMapping":"/api/index/indexInfo"}&t=' + new Date()['getTime']() + '&loginType=2';
    const _0x2dd4e0 = _0x1a0ab1['kPUAW'](PostRequests, _0x15ce2e);
    return new Promise(_0x381f92 => {
        var _0x12dabd = {
            'xIyUD': function(_0x44e848, _0x2f0fe8) {
                return _0x1a0ab1['lnbkT'](_0x44e848, _0x2f0fe8);
            },
            'tOJDg': function(_0x7bca87, _0x542d5e) {
                return _0x1a0ab1['zyKcm'](_0x7bca87, _0x542d5e);
            },
            'BJcKo': function(_0x101948, _0x3c364e) {
                return _0x101948 + _0x3c364e;
            },
            'xLaSw': function(_0xbeeedf, _0x8d0ab2) {
                return _0x1a0ab1['EDTuL'](_0xbeeedf, _0x8d0ab2);
            },
            'wgLqj': 'false',
            'jhiij': _0x1a0ab1['ShfQq'],
            'NzcyJ': 'vnAPr',
            'kjQLB': function(_0xc221eb, _0x3dc627) {
                return _0x1a0ab1['orrwx'](_0xc221eb, _0x3dc627);
            },
            'XQjFo': _0x1a0ab1['YuAYJ'],
            'oftTM': function(_0x51c0fa, _0xabb28b) {
                return _0x51c0fa + _0xabb28b;
            },
            'rcqEp': function(_0x55a6b6, _0x405a64) {
                return _0x55a6b6 < _0x405a64;
            },
            'CsuMA': 'EVHqL',
            'xkhUX': _0x1a0ab1['eAoey'],
            'wmxXy': function(_0x25178d, _0x43eec1) {
                return _0x1a0ab1['xcwwJ'](_0x25178d, _0x43eec1);
            },
            'VhlEG': function(_0x2ddc62, _0x2e1d13) {
                return _0x1a0ab1['byXXY'](_0x2ddc62, _0x2e1d13);
            },
            'SWdDE': _0x1a0ab1['IQuts'],
            'CSToP': function(_0x206ee3) {
                return _0x206ee3();
            }
        };
        if (_0x1a0ab1['RzdVl']('rkFvv', _0x1a0ab1['RmYnm'])) {
            $['post'](_0x2dd4e0, async (_0x3dd33a, _0x23736d, _0x5b66c4) => {
                if (_0x12dabd['xLaSw'](_0x12dabd['jhiij'], _0x12dabd['NzcyJ'])) {
                    var _0x31b96f = _0x12dabd['xIyUD'](~~_0x12dabd['tOJDg'](Math['random'](), count), i);
                    newsharecodes[i] = arr[_0x31b96f];
                    arr[_0x31b96f] = arr[i];
                    count--;
                } else {
                    try {
                        const _0x226efd = JSON['parse'](_0x5b66c4);
                        if (logs) $['log'](_0x5b66c4);
                        if (_0x226efd && _0x226efd['code'] && _0x226efd['code'] == 0xc8) {
                            if (_0x12dabd['kjQLB']('LBZrf', _0x12dabd['XQjFo'])) {
                                _0x381f92();
                            } else {
                                console['log'](_0x12dabd['oftTM'](_0x226efd['data']['listName'], '\x0a'));
                                for (let _0x3b7f3b = 0x0; _0x12dabd['rcqEp'](_0x3b7f3b, 0x5); _0x3b7f3b++) {
                                    if ('EVHqL' === _0x12dabd['CsuMA']) {
                                        let _0x161a04 = _0x226efd['data']['brandWall'][_0x3b7f3b]['id']['match'](/\w+/);
                                        brandlistArr['push'](_0x161a04);
                                    } else {
                                        $['log'](_0x12dabd['BJcKo'](_0x226efd['msg'], '\x0a'));
                                    }
                                }
                                $['log'](_0x12dabd['oftTM'](_0x12dabd['xkhUX'], _0x12dabd['wmxXy'](distinct, brandlistArr)));
                                await $['wait'](0x1f40);
                            }
                        } else {
                            if (_0x12dabd['VhlEG'](_0x12dabd['SWdDE'], 'cdiAg')) {
                                $['log'](_0x12dabd['oftTM'](_0x12dabd['oftTM']('😫', _0x226efd['msg']), '\x0a'));
                            } else {
                                Object['keys'](jdCookieNode)['forEach'](_0x5b97f8 => {
                                    cookiesArr['push'](jdCookieNode[_0x5b97f8]);
                                });
                                if (process['env']['JD_DEBUG'] && _0x12dabd['xLaSw'](process['env']['JD_DEBUG'], _0x12dabd['wgLqj'])) console['log'] = () => {};
                            }
                        }
                    } catch (_0x4b2b1d) {
                        $['logErr'](_0x4b2b1d, _0x23736d);
                    } finally {
                        _0x12dabd['CSToP'](_0x381f92);
                    }
                }
            });
        } else {
            _0x1a0ab1['WQCkG'](_0x381f92);
        }
    });
}
async function readShareCodes() {
    var _0x4f4857 = {
        'JORfJ': function(_0x173c02, _0x5100da) {
            return _0x173c02 + _0x5100da;
        },
        'KJQEj': 'gzip, deflate, br',
        'BHsBh': 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
        'oxGxR': function(_0x18a12b, _0xb86a56) {
            return _0x18a12b === _0xb86a56;
        },
        'XOmmp': 'IQLOi',
        'TyjVx': function(_0x22849c, _0x2f983b) {
            return _0x22849c < _0x2f983b;
        },
        'VtlYK': 'bzWWr',
        'GRMQf': 'DmIKx'
    };
    return new Promise(_0x20ce88 => {
        var _0x538773 = {
            'dmfxR': _0x4f4857['KJQEj'],
            'EEliO': 'zh-cn',
            'eyJeb': 'keep-alive',
            'kFBye': _0x4f4857['BHsBh'],
            'Kauhz': function(_0x3d038c) {
                return _0x3d038c();
            },
            'wUGzY': function(_0x31bc50, _0x138c94) {
                return _0x4f4857['oxGxR'](_0x31bc50, _0x138c94);
            },
            'Gcdcx': 'chKDS',
            'CdmeA': _0x4f4857['XOmmp'],
            'uOPVA': function(_0x2993cf, _0x391c64) {
                return _0x4f4857['TyjVx'](_0x2993cf, _0x391c64);
            },
            'CULUz': _0x4f4857['VtlYK']
        };
        if (_0x4f4857['oxGxR']('yytSP', _0x4f4857['GRMQf'])) {
            $['log'](_0x4f4857['JORfJ']('😫' + result['msg'], '\x0a'));
        } else {
            let _0x3dda6d = {
                'url': 'https://raw.githubusercontent.com/Ariszy/TGBOT/main/'
            };
            $['get'](_0x3dda6d, async (_0x54d8ef, _0xca618d, _0x342c34) => {
                if (_0x538773['wUGzY'](_0x538773['Gcdcx'], _0x538773['Gcdcx'])) {
                    try {
                        if (_0x538773['wUGzY'](_0x538773['CdmeA'], _0x538773['CdmeA'])) {
                            const _0x320d15 = JSON['parse'](_0x342c34);
                            if (!![]) {
                                var _0x10a3ef = new Array();
                                for (var _0x52f231 in _0x320d15) {
                                    _0x10a3ef['push'](_0x320d15[_0x52f231]);
                                }
                                var _0x3a2d3e = new Array();
                                for (let _0x52f231 = 0x0; _0x538773['uOPVA'](_0x52f231, _0x10a3ef['length']); _0x52f231++) {
                                    if (_0x538773['wUGzY'](_0x538773['CULUz'], 'jkjPZ')) {
                                        const _0x58dd3e = 'https://brandquiz.m.jd.com/api/' + uri;
                                        const _0x15ec7a = 'GET';
                                        const _0x433a86 = {
                                            'Accept': 'application/json, text/plain, */*',
                                            'Accept-Encoding': _0x538773['dmfxR'],
                                            'Accept-Language': _0x538773['EEliO'],
                                            'Connection': _0x538773['eyJeb'],
                                            'Cookie': cookie,
                                            'User-Agent': _0x538773['kFBye']
                                        };
                                        return {
                                            'url': _0x58dd3e,
                                            'method': _0x15ec7a,
                                            'headers': _0x433a86
                                        };
                                    } else {
                                        for (var _0x2ae09c in _0x10a3ef[_0x52f231]) {
                                            _0x3a2d3e['push'](_0x10a3ef[_0x52f231][_0x2ae09c]['Code']);
                                        }
                                    }
                                }
                                CodeArr = _0x3a2d3e;
                                return _0x3a2d3e;
                            }
                        } else {
                            $['logErr'](e, _0xca618d);
                        }
                    } catch (_0xcf3847) {
                        $['logErr'](_0xcf3847, _0xca618d);
                    } finally {
                        _0x538773['Kauhz'](_0x20ce88);
                    }
                } else {
                    _0x538773['Kauhz'](_0x20ce88);
                }
            });
        }
    });
}
async function formatcode() {
    var _0x44b15d = {
        'THFLz': function(_0x38e83b) {
            return _0x38e83b();
        },
        'AWDMs': function(_0x57d3b5, _0x4dad52) {
            return _0x57d3b5 < _0x4dad52;
        },
        'AuCNu': function(_0x291536, _0xc7d03d) {
            return _0x291536 - _0xc7d03d;
        },
        'Dkphs': function(_0x25de5e, _0x265a13) {
            return _0x25de5e + _0x265a13;
        },
        'FtWgB': function(_0x5ee03a, _0x3eba3d) {
            return _0x5ee03a + _0x3eba3d;
        },
        'SLVeE': '随机取出',
        'tYNPs': function(_0x206e4e, _0x488b20) {
            return _0x206e4e + _0x488b20;
        },
        'Xdpgn': function(_0x1eafd, _0x1ff051) {
            return _0x1eafd + _0x1ff051;
        },
        'PWKRf': function(_0x55d215, _0x2cafe0) {
            return _0x55d215(_0x2cafe0);
        },
        'WLmAi': function(_0x2ac7a5, _0x49b279) {
            return _0x2ac7a5 * _0x49b279;
        }
    };
    await _0x44b15d['THFLz'](readShareCodes);
    var _0x3d33e1 = [];
    var _0x5e63ba = CodeArr;
    var _0x156706 = _0x5e63ba['length'];
    for (var _0x3f8152 = 0x0; _0x44b15d['AWDMs'](_0x3f8152, _0x44b15d['AuCNu'](0x5, cookiesArr['length'])); _0x3f8152++) {
        var _0x5ba244 = _0x44b15d['Dkphs'](~~(Math['random']() * _0x156706), _0x3f8152);
        _0x3d33e1[_0x3f8152] = _0x5e63ba[_0x5ba244];
        _0x5e63ba[_0x5ba244] = _0x5e63ba[_0x3f8152];
        _0x156706--;
    }
    console['log'](_0x44b15d['Dkphs'](_0x44b15d['FtWgB'](_0x44b15d['SLVeE'], _0x44b15d['AuCNu'](0x5, cookiesArr['length'])), '个助力码,账号') + ($['UserName'] + '即将助力【') + _0x3d33e1 + '】\x0a');
    for (let _0x3f8152 = 0x0; _0x3f8152 < _0x3d33e1['length']; _0x3f8152++) {
        console['log'](_0x44b15d['tYNPs']('开始第' + _0x44b15d['Xdpgn'](_0x3f8152, 0x1) + '次随机助力' + _0x3d33e1[_0x3f8152], '\x0a'));
        await _0x44b15d['PWKRf'](dosupport, _0x3d33e1[_0x3f8152]);
        await $['wait'](_0x44b15d['WLmAi'](0x3e8, _0x3d33e1['length']));
    }
}
async function showmsg() {
    var _0x4eee18 = {
        'YdknB': function(_0x43372b, _0x1879c0) {
            return _0x43372b <= _0x1879c0;
        },
        'EAiRc': function(_0x4c6ac0, _0x5d7180) {
            return _0x4c6ac0 >= _0x5d7180;
        },
        'sEcoj': 'https://bean.m.jd.com/bean/signIndex.action',
        'soXNw': function(_0x556384, _0x4ac59c) {
            return _0x556384 === _0x4ac59c;
        },
        'ppPtZ': 'jrslI',
        'liOde': function(_0x468c3f, _0x41def0) {
            return _0x468c3f == _0x41def0;
        },
        'TIfqY': function(_0x56a194, _0x39029b) {
            return _0x56a194 >= _0x39029b;
        },
        'ZJPUt': function(_0x480b85, _0x4511cc) {
            return _0x480b85 == _0x4511cc;
        },
        'WwWNl': function(_0xe5767, _0x55a066) {
            return _0xe5767 >= _0x55a066;
        },
        'WMqnn': function(_0xc31871, _0x23f1db) {
            return _0xc31871 !== _0x23f1db;
        },
        'fCSET': 'yaWax'
    };
    if (tz == 0x1) {
        if (_0x4eee18['soXNw']('jrslI', _0x4eee18['ppPtZ'])) {
            if ($['isNode']()) {
                if (_0x4eee18['liOde'](hour, 0xc) && _0x4eee18['YdknB'](minute, 0x14) || _0x4eee18['liOde'](hour, 0x17) && _0x4eee18['TIfqY'](minute, 0x28)) {
                    await notify['sendNotify']($['name'], message);
                } else {
                    $['log'](message);
                }
            } else {
                if (_0x4eee18['ZJPUt'](hour, 0xc) && minute <= 0x14 || _0x4eee18['ZJPUt'](hour, 0x17) && _0x4eee18['WwWNl'](minute, 0x28)) {
                    $['msg'](zhiyi, '', message);
                } else {
                    if (_0x4eee18['WMqnn'](_0x4eee18['fCSET'], 'sSccP')) {
                        $['log'](message);
                    } else {
                        if (hour == 0xc && _0x4eee18['YdknB'](minute, 0x14) || hour == 0x17 && _0x4eee18['EAiRc'](minute, 0x28)) {
                            $['msg'](zhiyi, '', message);
                        } else {
                            $['log'](message);
                        }
                    }
                }
            }
        } else {
            $['msg']($['name'], '【提示】请先获取cookie\x0a直接使用NobyDa的京东签到获取', _0x4eee18['sEcoj'], {
                'open-url': _0x4eee18['sEcoj']
            });
            return;
        }
    } else {
        $['log'](message);
    }
}

function jsonParse(_0x293d6b) {
    var _0x326fa3 = {
        'MDquB': 'string',
        'qjecl': function(_0x1d4710, _0x3010b8) {
            return _0x1d4710 === _0x3010b8;
        },
        'KUNjE': 'royko',
        'yHIIn': 'fJZFc',
        'bnHUZ': '请勿随意在BoxJs输入框修改内容\n建议通过脚本去获取cookie'
    };
    if (typeof _0x293d6b == _0x326fa3['MDquB']) {
        if (_0x326fa3['qjecl'](_0x326fa3['KUNjE'], _0x326fa3['yHIIn'])) {
            hour = new Date()['getHours']();
            minute = new Date()['getMinutes']();
        } else {
            try {
                return JSON['parse'](_0x293d6b);
            } catch (_0x734647) {
                console['log'](_0x734647);
                $['msg']($['name'], '', _0x326fa3['bnHUZ']);
                return [];
            }
        }
    }
}

function distinct(_0x5c2519) {
    return Array['from'](new Set(_0x5c2519));
};
_0xodx = 'jsjiami.com.v6'


function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`\ud83d\udd14${this.name}, \u5f00\u59cb!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),a={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(a,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t){let e={"M+":(new Date).getMonth()+1,"d+":(new Date).getDate(),"H+":(new Date).getHours(),"m+":(new Date).getMinutes(),"s+":(new Date).getSeconds(),"q+":Math.floor(((new Date).getMonth()+3)/3),S:(new Date).getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,((new Date).getFullYear()+"").substr(4-RegExp.$1.length)));for(let s in e)new RegExp("("+s+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?e[s]:("00"+e[s]).substr((""+e[s]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t.stack):this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${s} \u79d2`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}
