const puppeteer = require('puppeteer');


let shops = []  // 长期有效的知名店铺某商品链接列表

shops = [
    'https://u.jd.com/2I0EsoX',
    'https://u.jd.com/2I0EsoX',
]

const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
let cookies = [],
    cookie = '';
if ($.isNode()) {
    Object.keys(jdCookieNode).forEach((item) => {
        cookiesArr.push(jdCookieNode[item])
    })
    if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => {};
} else {
    cookiesArr = [$.getdata('CookieJD'), $.getdata('CookieJD2'), ...jsonParse($.getdata('CookiesJD') || "[]").map(item => item.cookie)].filter(item => !!item);
}

for (let cookie of cookies) {

    console.log(cookie)

    let ls = cookie.split(';').slice(0, 2)

    // console.log(ls)

    let cks = []  // 可用的ck键值对

    for (let ck of ls) {
        let res = {}
        let pre = ck.split('=')
        res.name = pre[0]
        res.value = pre[1]
        cks.push(res)
    }

    // console.log(cks)


    // 开始模拟访问锁定
    (async () => {
        const browser = await puppeteer.launch(
            {
                headless: true,  // 显示浏览器
                timeout: 30000,  // 超时时间
                args: [`--window-size=${375},${800}`, '--no-sandbox'],  // 设置窗口大小
            }
        );
        const page = await browser.newPage();

        // 循环访问多个店铺网址
        for (let url of shops) {
            const cookies = cks  // 读取用户cookie
            await page.emulate(puppeteer.devices['iPhone X']);   // 模拟设备
            await page.goto('https://m.jd.com/');  // 先打开京东页面
            await page.waitForTimeout(3000);  // 等待3s
            await page.setCookie(...cookies);  // 注入cookie
            // await page.setUserAgent('jdapp;android;8.3.0;10;d41d8cd98f00b204;network/wifi;model/MI6;addressid/541286672;aid/d41d8cd98f00b204;oaid/;osVer/29;appBuild/69909;psn/d41d8cd98f00b204|80;psq/2;uid/d41d8cd98f00b204;adk/;ads/;pap/JA2015_311210|8.3.0|ANDROID 10;osv/10;pv/79.2;jdv/0|androIDApp|t_335139774|appshare|QQfriends|1573031758004|1573031758;ref/com.jingdong.app.mall.home.JDHomeFragment;partner/google;apprpd/Home_Main;Mozilla/5.0 (Linux; Android 10; MI 6 Build/QP1A.190711.020; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/74.0.3729.186 Mobile Safari/537.36');
            await page.goto(url,
                {
                    referer: url
                }
            );  // 打开锁佣页面
            await page.screenshot({path: 'full.png', fullPage: true});
            await page.waitForTimeout(5000) // 等待5s
        }
        await browser.close();
    })();
}
