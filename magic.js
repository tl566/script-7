// noinspection JSCheckFunctionSignatures
const axios = require('axios');
const {Md5} = require("ts-md5");

const {format} = require("date-fns");
const notify = require('./sendNotify');
const jdCookieNode = require('./jdCookie.js');
const CryptoJS = require("crypto-js");
const cookies = [];
Object.keys(jdCookieNode).forEach((item) => {
    cookies.push(jdCookieNode[item])
})

const USER_AGENTS = [
    "jdapp;android;10.0.2;10;network/wifi;Mozilla/5.0 (Linux; Android 10; ONEPLUS A5010 Build/QKQ1.191014.012; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045230 Mobile Safari/537.36",
    "jdapp;iPhone;10.0.2;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
    "jdapp;android;10.0.2;9;network/4g;Mozilla/5.0 (Linux; Android 9; Mi Note 3 Build/PKQ1.181007.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/66.0.3359.126 MQQBrowser/6.2 TBS/045131 Mobile Safari/537.36",
    "jdapp;android;10.0.2;10;network/wifi;Mozilla/5.0 (Linux; Android 10; GM1910 Build/QKQ1.190716.003; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045230 Mobile Safari/537.36",
    "jdapp;android;10.0.2;9;network/wifi;Mozilla/5.0 (Linux; Android 9; 16T Build/PKQ1.190616.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/66.0.3359.126 MQQBrowser/6.2 TBS/044942 Mobile Safari/537.36",
    "jdapp;iPhone;10.0.2;13.6;network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 13_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
    "jdapp;iPhone;10.0.2;13.6;network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 13_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
    "jdapp;iPhone;10.0.2;13.5;network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 13_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
    "jdapp;iPhone;10.0.2;14.1;network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 14_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
    "jdapp;iPhone;10.0.2;13.3;network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 13_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
    "jdapp;iPhone;10.0.2;13.7;network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 13_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
    "jdapp;iPhone;10.0.2;14.1;network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 14_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
    "jdapp;iPhone;10.0.2;13.3;network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 13_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
    "jdapp;iPhone;10.0.2;13.4;network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 13_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
    "jdapp;iPhone;10.0.2;14.3;network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
    "jdapp;android;10.0.2;9;network/wifi;Mozilla/5.0 (Linux; Android 9; MI 6 Build/PKQ1.190118.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/66.0.3359.126 MQQBrowser/6.2 TBS/044942 Mobile Safari/537.36",
    "jdapp;android;10.0.2;11;network/wifi;Mozilla/5.0 (Linux; Android 11; Redmi K30 5G Build/RKQ1.200826.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045511 Mobile Safari/537.36",
    "jdapp;iPhone;10.0.2;11.4;network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 11_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15F79",
    "jdapp;android;10.0.2;10;;network/wifi;Mozilla/5.0 (Linux; Android 10; M2006J10C Build/QP1A.190711.020; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045230 Mobile Safari/537.36",
    "jdapp;android;10.0.2;10;network/wifi;Mozilla/5.0 (Linux; Android 10; M2006J10C Build/QP1A.190711.020; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045230 Mobile Safari/537.36",
    "jdapp;android;10.0.2;10;network/wifi;Mozilla/5.0 (Linux; Android 10; ONEPLUS A6000 Build/QKQ1.190716.003; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045224 Mobile Safari/537.36",
    "jdapp;android;10.0.2;9;network/wifi;Mozilla/5.0 (Linux; Android 9; MHA-AL00 Build/HUAWEIMHA-AL00; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/66.0.3359.126 MQQBrowser/6.2 TBS/044942 Mobile Safari/537.36",
    "jdapp;android;10.0.2;8.1.0;network/wifi;Mozilla/5.0 (Linux; Android 8.1.0; 16 X Build/OPM1.171019.026; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/66.0.3359.126 MQQBrowser/6.2 TBS/044942 Mobile Safari/537.36",
    "jdapp;android;10.0.2;8.0.0;network/wifi;Mozilla/5.0 (Linux; Android 8.0.0; HTC U-3w Build/OPR6.170623.013; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/66.0.3359.126 MQQBrowser/6.2 TBS/044942 Mobile Safari/537.36",
    "jdapp;iPhone;10.0.2;14.0.1;network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 14_0_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
    "jdapp;android;10.0.2;10;network/wifi;Mozilla/5.0 (Linux; Android 10; LYA-AL00 Build/HUAWEILYA-AL00L; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045230 Mobile Safari/537.36",
    "jdapp;iPhone;10.0.2;14.2;network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 14_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
    "jdapp;iPhone;10.0.2;14.3;network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
    "jdapp;iPhone;10.0.2;14.2;network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 14_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
    "jdapp;android;10.0.2;8.1.0;network/wifi;Mozilla/5.0 (Linux; Android 8.1.0; MI 8 Build/OPM1.171019.026; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/66.0.3359.126 MQQBrowser/6.2 TBS/045131 Mobile Safari/537.36",
    "jdapp;android;10.0.2;10;network/wifi;Mozilla/5.0 (Linux; Android 10; Redmi K20 Pro Premium Edition Build/QKQ1.190825.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045227 Mobile Safari/537.36",
    "jdapp;iPhone;10.0.2;14.3;network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
    "jdapp;iPhone;10.0.2;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
    "jdapp;android;10.0.2;11;network/wifi;Mozilla/5.0 (Linux; Android 11; Redmi K20 Pro Premium Edition Build/RKQ1.200826.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045513 Mobile Safari/537.36",
    "jdapp;android;10.0.2;10;network/wifi;Mozilla/5.0 (Linux; Android 10; MI 8 Build/QKQ1.190828.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045227 Mobile Safari/537.36",
    "jdapp;iPhone;10.0.2;14.1;network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 14_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
]

const $ = axios.create({
    timeout: 3000
});
//公共ua
$.defaults.headers['Accept'] = '*/*';
$.defaults.headers['User-Agent'] = USER_AGENTS[randomNumber(0,
    USER_AGENTS.length)];
$.defaults.headers['Connection'] = 'keep-alive';
$.defaults.headers['Accept-Language'] = "zh-CN,zh-Hans;q=0.9";
$.defaults.headers['Accept-Encoding'] = "gzip, deflate, br";

// 1. 请求拦截器
$.interceptors.request.use(function (config) {
    // console.log(`${config.url} xxxxxxxxx`)
    //  任何请求都会经过这一步   在发送请求之前做些什么
    // console.log(config.url);
    // 这里一定要return   否则配置不成功
    return config;
}, function (err) {
    // 对请求错误做点什么
    console.log("request", err)
    return Promise.reject(err)
})
// 响应拦截器
$.interceptors.response.use(function (res) {
    //在接收响应做些什么
    if (typeof res.data === 'string' && res.data.includes('jsonpCBK')) { //财富岛jsonp解析
        console.log(res.data)
        return JSON.parse(res.data.replace(/jsonpCBK.*\(/, '').replace(')', ''))
        // return JSON.parse(res.data.replace(/jsonpCBK.?\(/, '').split('\n')[0])
    }
    return res.data;
}, function (err) {
    console.log('response', err)
    //对响应错误做点什么
    if (err.response.status > 200) {
        console.log(err.response.data);
    }
    return Promise.reject(err.response.data)
})

function randomNumber(min = 0, max = 100) {
    return Math.min(Math.floor(min + Math.random() * (max - min)), max);
}

class Env {
    constructor(name) {
        this.name = name
    }

    async wait(min, max) {
        if (max) {
            return new Promise(
                (resolve) => setTimeout(resolve, this.random(min, max)));
        } else {
            return new Promise((resolve) => setTimeout(resolve, min));
        }
    }

    md5(str) {
        return Md5.hashStr(str).toString()
    }

    decrypt(stk, url, appId) {
        const timestamp = this.now('yyyyMMddhhmmssSSS')
        const random = '5gkjB6SpmC9s';
        let token = `tk01wcdf61cb3a8nYUtHcmhSUFFCfddDPRvKvYaMjHkxo6Aj7dhzO+GXGFa9nPXfcgT+mULoF1b1YIS1ghvSlbwhE0Xc`;
        let fingerprint = 9686767825751161;
        const str = `${token}${fingerprint}${timestamp}${appId}${random}`;
        let hash1 = CryptoJS.SHA512(str, token).toString(CryptoJS.enc.Hex);
        let st = '';
        stk.split(',').map((item, index) => {
            st += `${item}:${this.getQueryString(url, item)}${index
            === stk.split(',').length - 1 ? '' : '&'}`;
        })
        const hash2 = CryptoJS.HmacSHA256(st, hash1.toString()).toString(
            CryptoJS.enc.Hex);
        return encodeURIComponent(
            ["".concat(timestamp.toString()), "".concat(fingerprint.toString()),
                "".concat(appId.toString()), "".concat(token),
                "".concat(hash2)].join(";"))
    }

    getQueryString(url, name) {
        let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        let r = url.match(reg);
        if (r != null) {
            return unescape(r[2]);
        }
        return '';
    }

    async run(data) {
        console.log(`${this.name} 开始运行...\n`)
        let start = new Date().getTime();
        $.message = ''
        //助力码获取
        if (data?.before) {
            $.ext = [];
            for (let i = 0; i <= cookies.length; i++) {
                if (cookies[i]) {
                    let cookie = cookies[i];
                    $.defaults.headers['Cookie'] = cookie;
                    $.username = decodeURIComponent(
                        cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(
                            /pt_pin=([^; ]+)(?=;?)/)[1])
                    $.index = i + 1;
                    try {
                        $.ext.push(await this.before($));
                    } catch (e) {
                        this.log(e, $)
                    }
                    if (data?.wait) {
                        await this.wait(data?.wait[0], data?.wait[1])
                    }
                }
            }
        }

        if (data?.once) {//执行一次
            await this.logic($)
        } else {
            for (let i = 0; i <= cookies.length; i++) {
                if (cookies[i]) {
                    let cookie = cookies[i];
                    $.defaults.headers['Cookie'] = cookie;
                    $.username = decodeURIComponent(
                        cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(
                            /pt_pin=([^; ]+)(?=;?)/)[1])
                    $.index = i + 1;
                    console.log(
                        `*********京东账号${$.index} ${$.username}*********`)
                    $.success = false
                    try {
                        await this.logic($)
                    } catch (e) {
                        this.log(e, $)
                    }
                    if (data?.wait) {
                        await this.wait(data?.wait[0], data?.wait[1])
                    }
                }
            }
        }
        console.log(`${this.name} 运行结束,耗时 ${new Date().getTime() - start}ms\n`)
        if ($.message) {
            if (data?.cmd) {
                await notify.sendNotify("/" + this.name, $.message)
            } else {
                await notify.sendNotify(this.name, $.message)
            }
        }
    }

    log(msg, m) {
        if (m) {
            console.log(`${this.now()}\t${m.username}\t动作---> ${msg}`)
        } else {
            console.log(`${this.now()}\t动作---> ${msg}`)
        }
    }

    async logic() {
        console.log("default logic")
    }

    async before() {
        return '';
    }

    async after() {
        return '';
    }

    match(pattern, string) {
        pattern = (pattern instanceof Array) ? pattern : [pattern];
        for (let pat of pattern) {
            const match = pat.exec(string);
            if (match) {
                const len = match.length;
                if (len === 1) {
                    return match;
                } else if (len === 2) {
                    return match[1];
                } else {
                    const r = [];
                    for (let i = 1; i < len; i++) {
                        r.push(match[i])
                    }
                    return r;
                }
            }
        }
        return '';
    }

    /**
     * 整点等待
     */
    async countdown() {
        let date = new Date();
        if (date.getMinutes() === 59) {
            let ms = this.now("s.SSS")
            if (ms < 59) {
                let st = (60 - ms) * 1000;
                console.log(` 需要等待时间 ${st / 1000} 秒`);
                await this.wait(st - 20)
            }
        }
    }

    random(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    async notify(text, desc) {
        return notify.sendNotify(text, desc);
    }

    async get(url, headers) {
        return new Promise((resolve, reject) => {
            $.get(url, {headers: headers}).then(data => resolve(data))
            .catch(e => reject(e))
        })
    }

    async post(url, body, headers) {
        return new Promise((resolve, reject) => {
            $.post(url, body, {headers: headers})
            .then(data => resolve(data))
            .catch(e => reject(e));
        })
    }

    randomNum(length) {
        length = length || 32;
        let t = "0123456789", a = t.length, n = "";
        for (let i = 0; i < length; i++) {
            n += t.charAt(Math.floor(Math.random() * a));
        }
        return n
    }

    randomString(e) {
        e = e || 32;
        let t = "0123456789abcdef", a = t.length, n = "";
        for (let i = 0; i < e; i++) {
            n += t.charAt(Math.floor(Math.random() * a));
        }
        return n
    }

    /**
     * 获取当前时间
     */
    now(fmt) {
        return format(new Date(), fmt || 'yyyy-MM-dd hh:mm:ss.SSS')
    }

    /**
     * 时间戳
     */
    timestamp() {
        return new Date().getTime()
    }

    getJxToken(m) {
        function generateStr(input) {
            let src = 'abcdefghijklmnopqrstuvwxyz1234567890';
            let res = '';
            for (let i = 0; i < input; i++) {
                res += src[Math.floor(src.length * Math.random())];
            }
            return res;
        }

        let phoneId = generateStr(40);
        let timestamp = Date.now().toString();
        let jstoken = Md5.hashStr(
            '' + decodeURIComponent(m.username) + timestamp + phoneId
            + 'tPOamqCuk9NLgVPAljUyIHcPRmKlVxDy');
        return {
            'strPgtimestamp': timestamp,
            'strPhoneID': phoneId,
            'strPgUUNum': jstoken
        }
    }

}

module.exports = {Env, cookies};