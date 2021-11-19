const got = require('got');
var md5 = require('md5');
const puppeteer = require('puppeteer');

const $ = new Env('京粉锁佣');

// 此处从环境变量中读取多个值
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
let cookies = []
if ($.isNode()) {
    Object.keys(jdCookieNode).forEach((item) => {
        cookies.push(jdCookieNode[item])
    })
    if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => {};
} else {
    cookies = [$.getdata('CookieJD'), $.getdata('CookieJD2'), ...jsonParse($.getdata('CookiesJD') || "[]").map(item => item.cookie)].filter(item => !!item);
}


// 开始按账号进行循环
for (let cookie of cookies) {
    /**
     * 第一部分功能，先提取购物车的商品链接并转链
     * @type {{headers: {cookie: string}}}
     */
    const options = {
        headers: {
            cookie: cookie
        }
    };

    $.UserName = decodeURIComponent(cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1])

    console.log("当前操作用户：" + $.UserName)   // 输出当前用户

    let urls = []
    // 提取购物车商品列表，最多20个
    async function getUrls() {
        let data = await got.get('https://p.m.jd.com/cart/cart.action?fromnav=1&sceneval=2&jxsid=16371654022816454477', options)
            .text()
        // console.log(data)

        const pattern = /skuItemUrl":"(.*?)\?/g
        const items = data.matchAll(pattern)

        if (pattern.test(data)) {
            for (let item of items) {
                console.log(item[1])
                urls.push(item[1])
            }
        }
        else {
            console.log("购物车为空")
        }

        // console.log(urls)
        return urls.slice(0, 30)  // 返回30个商品链接
    }

    const appKey = '61A0BC48DB485329C2691099CCC5E47F'
    const appSecret = '11A09359DEC125B071FC0B5425CBCBEE1EE3C4C69A62262512681C15FC9997B9'
    const unionId = 1002497745  // 联盟id
    let timestamp = (new Date()).valueOf()
    let copywriting = ''  // 待转链文案，此处仅需要原商品链接即可
    const version = 'v1'  // 版本，建议v1

    // 计算打工人api的sign
    function makeSign(copywriting) {
        let signPre = `appKey${appKey}copywriting${copywriting}timestamp${timestamp}unionId${unionId}version${version}`  // ascii值排序
        let signStr = appSecret + signPre + appSecret
        return md5(signStr).toUpperCase()
    }


    // 将列表商品使用打工人联盟转链接口进行转链，返回推广链接
    async function changeLinks(urls) {
        // console.log(urls)
        let finalUrls = []
        for (url of urls) {
            // console.log("当前访问商品:" + url)
            let sign = makeSign(url)
            // console.log(sign)

            let params = {
                "appKey": appKey,
                "timestamp": timestamp,
                "sign": sign,
                "copywriting": url,
                "unionId": unionId,
                "version": version
            }

            const {data} = await got.post('https://www.dgrlm.com/qcypopen/open/v1/qcSmartChain', {
                json: params
            }).json();
            // console.log(data)  // 返回接口结果
            await $.wait(parseInt(Math.random() * 500, 10))
            try {
                finalUrls.push(data.skuInfos[0].skuUrl)
            }
            catch(err){
                console.log('当前商品不在推广中')
            }
        }
        // console.log(finalUrls)  // 输出所有转链后的链接
        return finalUrls
        // console.log(finalUrls)
    }

    // 获取最终转链的链接列表
    getUrls().then(result=>{
        // console.log(result)
        changeLinks(result).then(urls=>{
            // console.log(urls)
            // 在这里执行访问锁佣功能

            let shops = urls  // 转链后的链接列表
            // todo:考虑增常见的店铺永久化链接

            let ls = cookie.split(';').slice(0,2)   // 调整为访问时所需的cookie格式
            // console.log(ls)
            let cks = []  // 可用的ck键值对
            for (let ck of ls) {
                let res = {}
                let pre = ck.split('=')
                res.name = pre[0]
                res.value = pre[1]
                cks.push(res)
            }

            // console.log(cks[1].value)

            // 开始模拟访问锁定
            (async () => {
                const browser = await puppeteer.launch(
                    {
                        headless: true,  // 显示浏览器
                        timeout: 30000,  // 超时时间
                        args: [`--window-size=${375},${800}`],  // 设置窗口大小
                    }
                );
                const page = await browser.newPage();

                // 循环访问多个店铺网址
                for (let url of shops) {
                    console.log("当前访问商品:" + url)
                    const cookies = cks  // 读取用户cookie
                    await page.emulate(puppeteer.devices['iPhone X']);   // 模拟设备
                    await page.goto(url);  // 先打开京东页面
                    await page.waitForTimeout(3000);  // 等待3s
                    await page.setCookie(...cookies);  // 注入cookie
                    // await page.setUserAgent('jdapp;android;8.3.0;10;d41d8cd98f00b204;network/wifi;model/MI6;addressid/541286672;aid/d41d8cd98f00b204;oaid/;osVer/29;appBuild/69909;psn/d41d8cd98f00b204|80;psq/2;uid/d41d8cd98f00b204;adk/;ads/;pap/JA2015_311210|8.3.0|ANDROID 10;osv/10;pv/79.2;jdv/0|androIDApp|t_335139774|appshare|QQfriends|1573031758004|1573031758;ref/com.jingdong.app.mall.home.JDHomeFragment;partner/google;apprpd/Home_Main;Mozilla/5.0 (Linux; Android 10; MI 6 Build/QP1A.190711.020; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/74.0.3729.186 Mobile Safari/537.36');
                    await page.goto(url);  // 打开锁佣页面
                    // await page.screenshot({ path: 'full.png', fullPage: true });
                    // await page.waitForTimeout(5000) // 等待5s
                }
                console.log('当前用户浏览完毕')
                await browser.close();
            })();
        })
    })
}




// prettier-ignore
function Env(t,e){"undefined"!=typeof process&&JSON.stringify(process.env).indexOf("GITHUB")>-1&&process.exit(0);class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}
