/*
活动口令

21.0复制整段话 Https:/Ju0NXaoXIV2ajA 分享链接￥3BsA017XEcyUbV%dakai》猄】崠】

10 12,18,23 13 10 * jd_dell.js
 */
const $ = new Env('戴尔');
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
const notify = $.isNode() ? require('./sendNotify') : '';
let cookiesArr = [];
Object.keys(jdCookieNode).forEach((item) => {
  cookiesArr.push(jdCookieNode[item])
})
let userName = '';
let cookie = '', token = '', buyerNick = '';
let activityData = {}, taskList = [];
let shareList = [];
let buyerNickInfo = {};
!(async () => {
  if (!cookiesArr[0]) {
    $.msg($.name, '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/bean/signIndex.action', {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});
    return;
  }
  for (let i = 0; i < cookiesArr.length; i++) {
    let index = i + 1;
    cookie = cookiesArr[i];
    userName = decodeURIComponent(cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1]);
    console.log(`\n*****开始【京东账号${index}】${userName}*****\n`);
    let nowTime = Date.now();
    if (nowTime < '1634140800000') {
      await main();
      await $.wait(1000);
    } else {
      console.log(`\n活动已结束`)
    }
  }
})().catch((e) => {
  $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
}).finally(() => {
  $.done();
});

async function main() {
  try {
    token = '';
    buyerNick = '';
    activityData = {};
    taskList = [];
    token = await getToken();
    if (!token) {
      console.log(`获取token失败`);
      return;
    }
    await takePostRequest('activity_load', `{"actId": "weiruan","userId": 1000000326,"jdToken": "${token}","source": "01","inviteNick": "","method": "/weiruan/activity_load","buyerNick": "${buyerNick}"}`);
    if (JSON.stringify(activityData) === '{}') {
      console.log(`获取活动详情失败`);
      return;
    }
    console.log(`获取活动详情成功`);
    buyerNick = activityData.missionCustomer.buyerNick;
    buyerNickInfo[userName] = buyerNick;
    // let shareInfo = "shareNick:" + encodeURIComponent(activityData.missionCustomer.buyerNick) + "&avatar:" + encodeURIComponent(activityData.missionCustomer.headPicUrl) + "&nickName:" + encodeURIComponent(activityData.missionCustomer.nickName);
    // let shareCode = Buffer.from(shareInfo).toString('base64');
    // console.log(`助力码：${shareCode}`);
    await takePostRequest('complete/mission', `{"actId":"weiruan","userId":"1000000326","inviterNick":"9E56nQr37v/RlB+z9uzuv2csCSbFrnrB9hDGvDjqt0yLOg+Ghw8GShho6QOVKD7CCqDoLm2UpGiBGSxUShLKpA==","missionType":"shareAct","method":"/weiruan/complete/mission","buyerNick":"${buyerNick}"}`);
    await $.wait(2000);
    await doTask();
    await $.wait(2000);
    await takePostRequest('activity_load', `{"jdToken":"${token}","source":"01","actId":"huangheRiver20210908","userId":"1000000326","method":"/fourteenGo/activity_load","buyerNick":"${buyerNick}"}`);
    await $.wait(2000);

    let remainChance = activityData.missionCustomer.remainChance;
    let drawTime = Math.floor(remainChance / 100);
    console.log(`当前积分${remainChance},可以抽奖${drawTime}次`);
    for (let i = 0; i < drawTime; i++) {
      await takePostRequest('draw/post', `{"actId":"weiruan","usedGameNum":"2","dataType":"draw","userId":1000000326,"method":"/weiruan/draw/post","buyerNick":"${buyerNick}"}`);
      await $.wait(2000);
    }
  } catch (e) {
    $.logErr(e)
  }
}

async function doTask() {
  console.log(`去签到`);
  await takePostRequest('complete/mission', `{"missionType":"ordinarySign","openId":"0","actId":"weiruan","userId":1000000326,"method":"/weiruan/complete/mission","buyerNick":"${buyerNick}"}`);
  await $.wait(1000)
  console.log(`去领京豆`);
  await takePostRequest('getBeans', `{"actId":"weiruan","userId":1000000326,"method":"/weiruan/getBeans","buyerNick":"${buyerNick}"}`);
  await $.wait(1000)
  await takePostRequest('mission/complete/state', `{"actId":"weiruan","userId":1000000326,"method":"/weiruan/mission/complete/state","buyerNick":"${buyerNick}"}`);
  //console.log(JSON.stringify(taskList));
  for (let i = 0; i < taskList.length; i++) {
    $.oneTask = taskList[i];
    if ($.oneTask.isComplete) {
      console.log(`任务：${$.oneTask.missionName},已完成`);
      continue;
    }
    if ($.oneTask.type === 'followShop') {
      console.log(`任务：${$.oneTask.missionName},去执行`);
      $.mapList = [];
      await takePostRequest('complete/mission', `{"missionType":"${$.oneTask.type}","actId":"weiruan","userId":1000000326,"goodsNumId":1000000326,"method":"/weiruan/complete/mission","buyerNick":"${buyerNick}"}`);
      await $.wait(2000);
    }

    if ($.oneTask.type === 'viewDaiErShop') {
      console.log(`任务：${$.oneTask.missionName},需要完成${$.oneTask.dayTop}次，已完成${$.oneTask.hasGotNum}次`);
      $.subList = [];
      let needTime = Number($.oneTask.dayTop) - Number($.oneTask.hasGotNum);
      for (let j = 0; j < needTime; j++) {
        console.log(`任务：${$.oneTask.missionName},等待15秒`);
        await $.wait(15000);
        await takePostRequest('complete/mission', `{"userId":1000000326,"actId":"weiruan","missionType":"${$.oneTask.type}","goodsNumId":"1000000140","method":"/weiruan/complete/mission","buyerNick":"${buyerNick}"}`);
      }
    }
    if ($.oneTask.type === 'viewThinkPadShop') {
      console.log(`任务：${$.oneTask.missionName},需要完成${$.oneTask.dayTop}次，已完成${$.oneTask.hasGotNum}次`);
      $.subList = [];
      let needTime = Number($.oneTask.dayTop) - Number($.oneTask.hasGotNum);
      for (let j = 0; j < needTime; j++) {
        console.log(`任务：${$.oneTask.missionName},等待15秒`);
        await $.wait(15000);
        await takePostRequest('complete/mission', `{"userId":1000000326,"actId":"weiruan","missionType":"${$.oneTask.type}","goodsNumId":"1000000158","method":"/weiruan/complete/mission","buyerNick":"${buyerNick}"}`);
      }
    }
    if ($.oneTask.type === 'viewBannerDisposable') {
      console.log(`任务：${$.oneTask.missionName},需要完成${$.oneTask.dayTop}次，已完成${$.oneTask.hasGotNum}次`);
      $.subList = [];
      let needTime = Number($.oneTask.dayTop) - Number($.oneTask.hasGotNum);
      for (let j = 0; j < needTime; j++) {
        console.log(`任务：${$.oneTask.missionName},等待15秒`);
        await $.wait(15000);
        await takePostRequest('complete/mission', `{"userId":1000000326,"actId":"weiruan","missionType":"${$.oneTask.type}","goodsNumId":1000000326,"method":"/weiruan/complete/mission","buyerNick":"${buyerNick}"}`);
      }
    }
    // //助力
    if ($.oneTask.type === 'shareAct') {
      let needTime = Number($.oneTask.dayTop) - Number($.oneTask.hasGotNum);
      shareList.push({
        'inviterNick': buyerNick,
        'user': userName,
        'needTime': needTime
      });
    }

  }
}

function takePostRequest(type, admJson) {
  let url = `https://mpdz-honour-dz.isvjcloud.com/dm/front/weiruan/${type}?mix_nick=${buyerNick}`;
  let body = `{"jsonRpc":"2.0","params":{"commonParameter":{"appkey":"51B59BB805903DA4CE513D29EC448375","m":"POST","timestamp":${Date.now()},"userId":"1000000326"},"admJson":${admJson}}}`;
  let myRequest = getPostRequest(url, body);
  return new Promise(async resolve => {
    $.post(myRequest, (err, resp, data) => {
      try {
        dealReturn(type, data);
      } catch (e) {
        console.log(data);
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
}

function dealReturn(type, data) {
  try {
    data = JSON.parse(data);
  } catch (e) {
    console.log(`执行任务异常`);
    console.log(data);
  }
  switch (type) {
    case 'activity_load':
      if (data.success && data.errorCode === '200') {
        activityData = data.data.data;
      }
      break;
    case 'mission/complete/state':
      if (data.success && data.errorCode === '200') {
        taskList = data.data.data;
      }
      break;
    case 'complete/mission':
      break;
    case 'draw/post':
    case 'getBeans':
      console.log(JSON.stringify(data));
      break;
    default:
      console.log(`错误${type}`);
  }
}

function getPostRequest(url, body) {
  const headers = {
    'X-Requested-With': `XMLHttpRequest`,
    'Connection': `keep-alive`,
    'Accept-Encoding': `gzip, deflate, br`,
    'Content-Type': `application/json; charset=utf-8`,
    'Origin': `https://mpdz-honour-dz.isvjcloud.com`,
    'User-Agent': $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
    'Cookie': cookie,
    'Host': `mpdz-honour-dz.isvjcloud.com`,
    'Referer': `https://mpdz-honour-dz.isvjcloud.com/micro/`,
    'Accept-Language': `zh-cn`,
    'Accept': `application/json`
  };
  return {url: url, headers: headers, body: body};
}

function getToken() {
  let config = {
    url: 'https://api.m.jd.com/client.action?functionId=isvObfuscator',
    body: 'area=2_2841_61104_0&body=%7B%22url%22%3A%22https%3A%5C/%5C/mpdz-honour-dz.isvjcloud.com%5C/micro%5C/?lng%3D121.393217%26lat%3D31.222852%26sid%3Daf5a66c169d23e5a6942251fe2d1da9w%26un_area%3D2_2841_61104_0%23%5C/pages%5C/Weiruan20211010%5C/Weiruan20211010?bizExtString%3Dc2hhcmVOaWNrOjk5JTJCNjFtVkdkdFdTJTJCYWFqVE4lMkJIVlY0dExOWUE0c2V1QTY3TU9JWVF4RWszVmw5JTJCQVZvNE5GJTJCdGd5ZUljNkE2a2RLM3JMQlFwRVFIOVY0dGRycmgwdyUzRCUzRCZpbnZpdGVBdmF0YXI6aHR0cCUzQSUyRiUyRnN0b3JhZ2UuMzYwYnV5aW1nLmNvbSUyRmkuaW1hZ2VVcGxvYWQlMkYzMTM4MzMzMDMyMzEzMjMyMzMyZDMyMzUzMTM2MzYzNjMxMzYzMjM1MzgzOTM3MzkzODMyMzEzMDMyX21pZC5qcGcmaW52aXRlTmlja25hbWU66buR5aSc5LiL55qE5b2p6Jm5%22%2C%22id%22%3A%22%22%7D&build=167841&client=apple&clientVersion=10.1.6&d_brand=apple&d_model=iPhone9%2C2&eid=eidI42470115RDhDRjM1NjktODdGQi00RQ%3D%3DB3mSBu%2BcGp7WhKUUyye8/kqi1lxzA3Dv6a89ttwC7YFdT6JFByyAtAfO0TOmN9G2os20ud7RosfkMq80&ext=%7B%22prstate%22%3A%220%22%7D&isBackground=N&joycious=88&lang=zh_CN&networkType=wifi&networklibtype=JDNetworkBaseAF&openudid=5a8a5743a5d2a4110a8ed396bb047471ea120c6a&osVersion=14.6&partner=apple&rfs=0000&scope=01&screen=1242%2A2208&sign=59d7a7d49cdc79f87aa3e9a8896db574&st=1634001989175&sv=100',
    headers: {
      'Host': 'api.m.jd.com',
      'accept': '*/*',
      'user-agent': 'JD4iPhone/167490 (iPhone; iOS 14.2; Scale/3.00)',
      'accept-language': 'zh-Hans-JP;q=1, en-JP;q=0.9, zh-Hant-TW;q=0.8, ja-JP;q=0.7, en-US;q=0.6',
      'content-type': 'application/x-www-form-urlencoded',
      'Cookie': cookie
    }
  }
  return new Promise(resolve => {
    $.post(config, async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          data = JSON.parse(data);
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data['token'] || '');
      }
    })
  })
}
function Env(t,e){"undefined"!=typeof process&&JSON.stringify(process.env).indexOf("GITHUB")>-1&&process.exit(0);class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}
