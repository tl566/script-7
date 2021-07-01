/*
* 路径：京东APP-》美食馆-》右侧瓜分京豆
*
*
* */
const $ = new Env('零食街');
const notify = $.isNode() ? require('./sendNotify') : '';
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
//是否加购物车
//const addCarFlag =  $.isNode() ? (process.env.ADD_CAR ? process.env.ADD_CAR : true):true;
let cookiesArr = [];
$.appkey = `51B59BB805903DA4CE513D29EC448375`;
if ($.isNode()) {
  Object.keys(jdCookieNode).forEach((item) => {
    cookiesArr.push(jdCookieNode[item])
  })
  if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => {};
} else {
  cookiesArr = [
    $.getdata("CookieJD"),
    $.getdata("CookieJD2"),
    ...$.toObj($.getdata("CookiesJD") || "[]").map((item) => item.cookie)].filter((item) => !!item);
}
!(async () => {
  if (!cookiesArr[0]) {
    $.msg($.name, '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/bean/signIndex.action', {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});
    return;
  }
  for (let i = 0; i < 1; i++) {
    $.index = i + 1;
    $.cookie = cookiesArr[i];
    $.isLogin = true;
    $.nickName = '';
    await TotalBean();
    $.UserName = decodeURIComponent($.cookie.match(/pt_pin=([^; ]+)(?=;?)/) && $.cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1]);
    console.log(`\n*****开始【京东账号${$.index}】${$.nickName || $.UserName}*****\n`);
    if (!$.isLogin) {
      $.msg($.name, `【提示】cookie已失效`, `京东账号${$.index} ${$.nickName || $.UserName}\n请重新登录获取\nhttps://bean.m.jd.com/bean/signIndex.action`, {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});
      if ($.isNode()) {
        await notify.sendNotify(`${$.name}cookie已失效 - ${$.UserName}`, `京东账号${$.index} ${$.UserName}\n请重新登录获取cookie`);
      }
      continue
    }
    await main();
    await $.wait(2000);
  }
})().catch((e) => {$.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')}).finally(() => {$.done();});

async function main() {
  $.token = '';
  await getToken();
  if($.token){
    console.log(`Token:${$.token}`);
  }else {
    console.log(`获取Token失败`);
    return;
  }
  await $.wait(500);
  $.thisNick = "";
  await takePostRequest('setMixNick');
  await $.wait(500);
  $.missionType = 'pv';
  await takePostRequest('foodRunningStats');
  if($.thisNick){
    console.log(`助力码：${$.thisNick}`);
  }else{
    console.log(`获取活动详情失败`);
    return;
  }
  await $.wait(2000);
  $.taskList = [];
  await takePostRequest('DailyTask');
  console.log(JSON.stringify($.taskList));
  await doTask();
  await $.wait(2000);
  $.sendCoinInfo = {};
  await takePostRequest('SendCoinNum');
  if(JSON.stringify($.sendCoinInfo) === '{}'){
    console.log(`获取首页树数据失败`)
  }else{
    $.getWhich = $.sendCoinInfo.which;
    if($.getWhich.length === 3){
      console.log(`首页树金币已全领取`);
    }else{
      for (let i = 0; i < 3; i++) {
        $.treeNumber = i;
        if($.getWhich.includes(i)){
          console.log(`首页树金币，第${i+1}次，已领取`);
          continue;
        }
        await takePostRequest('dotree');
        await $.wait(500);
        $.missionType = 'treeCoin';
        await takePostRequest('foodRunningStats');
        await $.wait(2000);
      }
    }
  }
}

async function doTask(){
  for (let i = 0; i < $.taskList.length; i++) {
    $.oneTaskInfo = $.taskList[i];
    if($.oneTaskInfo.id === '1' || $.oneTaskInfo.id === '2' || $.oneTaskInfo.id === '3'){
      if($.oneTaskInfo.dayTop === $.oneTaskInfo.hasGotNum){
        console.log(`任务：${$.oneTaskInfo.missionName},已完成`);
      }else{
        let start = 0;
        if($.oneTaskInfo.hasGotNum){
          start = $.oneTaskInfo.hasGotNum;
        }
        for (let j = start; j < $.oneTaskInfo.dayTop; j++){
          console.log(`执行任务，第${j+1}次，${$.oneTaskInfo.missionName}`);
          $.runId = '';
          await takePostRequest(($.oneTaskInfo.type).replace(/( |^)[a-z]/g,(L)=>L.toUpperCase()));
          await $.wait(2000);
          console.log(`runId，${$.runId}`);
          if($.runId){
            await takePostRequest('complete/mission');
            await $.wait(2000);
          }
        }
      }
    }else {
      console.log(`任务：${$.oneTaskInfo.missionName},不执行`);
    }
    // else if(addCarFlag && $.oneTaskInfo.id === '4'){
    //
    //   $.hotGoodsList = [];
    //   await takePostRequest('HotGoodsList');
    // }
  }
}

async function takePostRequest(type){
  let url = '';
  let body = ``;
  switch (type) {
    case 'setMixNick':
    case 'DailyTask':
    case 'ViewShop':
    case 'ViewBanner':
    case 'ViewGoods':
      url = `https://jinggengjcq-isv.isvjcloud.com/dm/front/foodRunning/${type}?open_id=&mix_nick=&bizExtString=&user_id=10299171`;
      body =  {"source":"01","strTMMixNick":$.token,"method":"/foodRunning/"+type,"actId":"jd_food_running","buyerNick":$.thisNick,"pushWay":1,"userId":"10299171"};
      break;
    case 'complete/mission':
      url = `https://jinggengjcq-isv.isvjcloud.com/dm/front/foodRunning/${type}?open_id=&mix_nick=&bizExtString=&user_id=10299171`;
      body =  {"goodsNumId":$.runId,"missionType":$.oneTaskInfo.type,"method":"/foodRunning/"+type,"actId":"jd_food_running","buyerNick":$.thisNick,"pushWay":1,"userId":"10299171"};
      break;
    case 'HotGoodsList':
    case 'SendCoinNum':
      url = `https://jinggengjcq-isv.isvjcloud.com/dm/front/foodRunning/${type}?open_id=&mix_nick=&bizExtString=&user_id=10299171`;
      body =  {"method":"/foodRunning/"+type,"actId":"jd_food_running","buyerNick":$.thisNick,"pushWay":1,"userId":"10299171"};
      break;
    case 'dotree':
      url = `https://jinggengjcq-isv.isvjcloud.com/dm/front/foodRunning/complete/mission?open_id=&mix_nick=&bizExtString=&user_id=10299171`;
      body =  {"which":$.treeNumber,"missionType":"treeCoin","method": "/foodRunning/complete/mission","actId":"jd_food_running","buyerNick":$.thisNick,"pushWay":1,"userId":"10299171"};
      break;
    case 'foodRunningStats':
      url = `https://jinggengjcq-isv.isvjcloud.com/dm/front/foodRunning/${type}?open_id=&mix_nick=&bizExtString=&user_id=10299171`;
      body =  {"missionType":$.missionType,"method":"/foodRunning/"+type,"actId":"jd_food_running","buyerNick":$.thisNick,"pushWay":1,"userId":"10299171"};
      break;
    default:
      console.log(`错误${type}`);
  }
  let myRequest = getPostRequest(url,body);
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
  data = JSON.parse(data);
  switch (type) {
    case 'setMixNick':
      if(data.success && data.errorCode === '200' && data.data && data.data.status && data.data.status === 200){
        $.thisNick = data.data.data.msg;
      }else{
        console.log(JSON.stringify(data));
      }
      break;
    case 'DailyTask':
      if(data.success && data.errorCode === '200' && data.data && data.data.status && data.data.status === 200){
        $.taskList = data.data.data;
      }else{
        console.log(JSON.stringify(data));
      }
      break;
    case 'ViewShop':
    case 'ViewBanner':
    case 'ViewGoods':
      console.log(JSON.stringify(data));
      if(data.success && data.errorCode === '200' && data.data && data.data.status && data.data.status === 200){
        $.runId = data.data.data.id;
      }else{
        console.log(JSON.stringify(data));
      }
      break;
    case 'complete/mission':
      if(data.success && data.errorCode === '200' && data.data && data.data.status && data.data.status === 200){
        console.log(`任务完成`);
      }else{
        console.log(JSON.stringify(data));
      }
    case 'SendCoinNum':
      if(data.success && data.errorCode === '200' && data.data && data.data.status && data.data.status === 200){
        $.sendCoinInfo = data.data.data
      }else{
        console.log(JSON.stringify(data));
      }
      break;
    case 'HotGoodsList':
      if(data.success && data.errorCode === '200' && data.data && data.data.status && data.data.status === 200){
        $.hotGoodsList = data.data.data;
      }else{
        console.log(JSON.stringify(data));
      }
      break;
    case 'dotree':
      if(data.success && data.errorCode === '200' && data.data && data.data.status && data.data.status === 200){
        console.log(`任务完成,获得${data.data.data.sendNum}`);
      }else{
        console.log(JSON.stringify(data));
      }
      break;
    case 'foodRunningStats':
      //if(data.success && data.errorCode === '200' && data.data && data.data.status && data.data.status === 200){

      //}else{
      console.log(JSON.stringify(data));
      //}
      break;
    default:
      console.log(JSON.stringify(data));
  }
}

function getPostRequest(url,body) {
  let signInfo = getSign(body);
  body = `{"jsonRpc":"2.0","params":{"commonParameter":{"appkey":"${$.appkey}","m":"POST","sign":"${signInfo.sign}","timestamp":${signInfo.timeStamp},"userId":"10299171"},"admJson":${JSON.stringify(body)}}}`;
  const headers = {
    'X-Requested-With' : `XMLHttpRequest`,
    'Connection' : `keep-alive`,
    'Accept-Encoding' : `gzip, deflate, br`,
    'Content-Type' : `application/json; charset=utf-8`,
    'Origin' : `https://jinggengjcq-isv.isvjcloud.com`,
    "User-Agent": $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
    "Cookie": $.cookie,
    'Host' : `jinggengjcq-isv.isvjcloud.com`,
    'Referer' : `https://jinggengjcq-isv.isvjcloud.com/paoku/index.html`,
    'Accept-Language' : `zh-cn`,
    'Accept' : `application/json`
  };

  return  {url: url, method: `POST`, headers: headers, body: body};
}


async function getToken() {
  return new Promise(async (resolve) => {
    let options = {
      url: `https://api.m.jd.com/client.action?functionId=isvObfuscator&clientVersion=10.0.4&build=88641&client=android&d_brand=OPPO&d_model=PCAM00&osVersion=10&screen=2208*1080&partner=oppo&oaid=&openudid=7049442d7e41523&eid=eidAfb0d81231cs3I4yd3GgLRjqcx9qFEcJEmyOMn1BwD8wvLt%2FpM7ENipVIQXuRiDyQ0FYw2aud9%20AhtGqo1Zhp0TsLEgoKZvAWkaXhApgim9hlEyRB&sdkVersion=29&lang=zh_CN&uuid=7049442d7e415232&aid=7049442d7e415232&area=4_48201_54794_0&networkType=4g&wifiBssid=unknown&uts=0f31TVRjBSsqndu4%2FjgUPz6uymy50MQJs2X%2FHz8dwQrKfrmFvPGJYcIhgT3KrbJ2slvZoaufp78QzL4RqQVUgaKH%2Fq7EntlwV7J5l6acE2Wlj2%2Bu6Thwe90cWmtV80fH0yhpOV%2FhYIwvD5N6W1zo3LCVXTcuOw%2BARC%2F6K3bndzn3KzMw%2FpkYzhE2JcXeXiD44r%2BkUMawpn%2Bk7XqSVytdBg%3D%3D&uemps=0-0&st=1624988916642&sign=6a25b389996897b263c70516fc3c71e1&sv=122`,
      body: `body=%7B%22id%22%3A%22%22%2C%22url%22%3A%22https%3A%2F%2Fjinggengjcq-isv.isvjcloud.com%2Fpaoku%2Findex.html%3Fsid%3D75b413510cb227103e928769818a74ew%26un_area%3D4_48201_54794_0%22%7D&`,
      headers: {
        "Host": "api.m.jd.com",
        "User-Agent": $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
        "Cookie": $.cookie,
      }
    }
    $.post(options, async (err, resp, data) => {
      try {
        const reust = JSON.parse(data);
        if(reust.errcode === 0){
          $.token = reust.token;
        }else {
          $.log(data)
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve();
      }
    });
  });
}

function getSign(t) {
  var e = Date.now()
    , i = '0282266f9a794112a0ab4ab6c78f8a09'
    , o = $.appkey
    , s = JSON.stringify(t)
    , c = encodeURIComponent(s)
    , r = new RegExp("'","g")
    , d = new RegExp("~","g");
  c = (c = c.replace(r, "%27")).replace(d, "%7E");
  var h = i + "admjson" + c + "appkey" + o + "m" + t.method + "timestamp" + e + i;
  return {sign: hex_md5(h.toLowerCase()), timeStamp: e}
}

function TotalBean() {
  return new Promise(async resolve => {
    const options = {
      url: "https://me-api.jd.com/user_new/info/GetJDUserInfoUnion",
      headers: {
        Host: "me-api.jd.com",
        Accept: "*/*",
        Connection: "keep-alive",
        Cookie: $.cookie,
        "User-Agent": $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
        "Accept-Language": "zh-cn",
        "Referer": "https://home.m.jd.com/myJd/newhome.action?sceneval=2&ufc=&",
        "Accept-Encoding": "gzip, deflate, br"
      }
    }
    $.get(options, (err, resp, data) => {
      try {
        if (err) {
          $.logErr(err)
        } else {
          if (data) {
            data = JSON.parse(data);
            if (data['retcode'] === "1001") {
              $.isLogin = false; //cookie过期
              return;
            }
            if (data['retcode'] === "0" && data.data && data.data.hasOwnProperty("userInfo")) {
              $.nickName = data.data.userInfo.baseInfo.nickname;
            }
          } else {
            $.log('京东服务器返回空数据');
          }
        }
      } catch (e) {
        $.logErr(e)
      } finally {
        resolve();
      }
    })
  })
}
var hexcase = 0;var b64pad  = "";var chrsz   = 8;function hex_md5(s){ return binl2hex(core_md5(str2binl(s), s.length * chrsz));} function b64_md5(s){ return binl2b64(core_md5(str2binl(s), s.length * chrsz));} function str_md5(s){ return binl2str(core_md5(str2binl(s), s.length * chrsz));} function hex_hmac_md5(key, data) { return binl2hex(core_hmac_md5(key, data)); } function b64_hmac_md5(key, data) { return binl2b64(core_hmac_md5(key, data)); } function str_hmac_md5(key, data) { return binl2str(core_hmac_md5(key, data)); }function core_md5(x, len) {   /* append padding */   x[len >> 5] |= 0x80 << ((len) % 32);   x[(((len + 64) >>> 9) << 4) + 14] = len;  var a =  1732584193;   var b = -271733879;   var c = -1732584194;   var d =  271733878;  for(var i = 0; i < x.length; i += 16)   {     var olda = a;     var oldb = b;     var oldc = c;     var oldd = d;    a = md5_ff(a, b, c, d, x[i+ 0], 7 , -680876936);     d = md5_ff(d, a, b, c, x[i+ 1], 12, -389564586);     c = md5_ff(c, d, a, b, x[i+ 2], 17,  606105819);     b = md5_ff(b, c, d, a, x[i+ 3], 22, -1044525330);     a = md5_ff(a, b, c, d, x[i+ 4], 7 , -176418897);     d = md5_ff(d, a, b, c, x[i+ 5], 12,  1200080426);     c = md5_ff(c, d, a, b, x[i+ 6], 17, -1473231341);     b = md5_ff(b, c, d, a, x[i+ 7], 22, -45705983);     a = md5_ff(a, b, c, d, x[i+ 8], 7 ,  1770035416);     d = md5_ff(d, a, b, c, x[i+ 9], 12, -1958414417);     c = md5_ff(c, d, a, b, x[i+10], 17, -42063);     b = md5_ff(b, c, d, a, x[i+11], 22, -1990404162);     a = md5_ff(a, b, c, d, x[i+12], 7 ,  1804603682);     d = md5_ff(d, a, b, c, x[i+13], 12, -40341101);     c = md5_ff(c, d, a, b, x[i+14], 17, -1502002290);     b = md5_ff(b, c, d, a, x[i+15], 22,  1236535329);    a = md5_gg(a, b, c, d, x[i+ 1], 5 , -165796510);     d = md5_gg(d, a, b, c, x[i+ 6], 9 , -1069501632);     c = md5_gg(c, d, a, b, x[i+11], 14,  643717713);     b = md5_gg(b, c, d, a, x[i+ 0], 20, -373897302);     a = md5_gg(a, b, c, d, x[i+ 5], 5 , -701558691);     d = md5_gg(d, a, b, c, x[i+10], 9 ,  38016083);     c = md5_gg(c, d, a, b, x[i+15], 14, -660478335);     b = md5_gg(b, c, d, a, x[i+ 4], 20, -405537848);     a = md5_gg(a, b, c, d, x[i+ 9], 5 ,  568446438);     d = md5_gg(d, a, b, c, x[i+14], 9 , -1019803690);     c = md5_gg(c, d, a, b, x[i+ 3], 14, -187363961);     b = md5_gg(b, c, d, a, x[i+ 8], 20,  1163531501);     a = md5_gg(a, b, c, d, x[i+13], 5 , -1444681467);     d = md5_gg(d, a, b, c, x[i+ 2], 9 , -51403784);     c = md5_gg(c, d, a, b, x[i+ 7], 14,  1735328473);     b = md5_gg(b, c, d, a, x[i+12], 20, -1926607734);    a = md5_hh(a, b, c, d, x[i+ 5], 4 , -378558);     d = md5_hh(d, a, b, c, x[i+ 8], 11, -2022574463);     c = md5_hh(c, d, a, b, x[i+11], 16,  1839030562);     b = md5_hh(b, c, d, a, x[i+14], 23, -35309556);     a = md5_hh(a, b, c, d, x[i+ 1], 4 , -1530992060);     d = md5_hh(d, a, b, c, x[i+ 4], 11,  1272893353);     c = md5_hh(c, d, a, b, x[i+ 7], 16, -155497632);     b = md5_hh(b, c, d, a, x[i+10], 23, -1094730640);     a = md5_hh(a, b, c, d, x[i+13], 4 ,  681279174);     d = md5_hh(d, a, b, c, x[i+ 0], 11, -358537222);     c = md5_hh(c, d, a, b, x[i+ 3], 16, -722521979);     b = md5_hh(b, c, d, a, x[i+ 6], 23,  76029189);     a = md5_hh(a, b, c, d, x[i+ 9], 4 , -640364487);     d = md5_hh(d, a, b, c, x[i+12], 11, -421815835);     c = md5_hh(c, d, a, b, x[i+15], 16,  530742520);     b = md5_hh(b, c, d, a, x[i+ 2], 23, -995338651);    a = md5_ii(a, b, c, d, x[i+ 0], 6 , -198630844);     d = md5_ii(d, a, b, c, x[i+ 7], 10,  1126891415);     c = md5_ii(c, d, a, b, x[i+14], 15, -1416354905);     b = md5_ii(b, c, d, a, x[i+ 5], 21, -57434055);     a = md5_ii(a, b, c, d, x[i+12], 6 ,  1700485571);     d = md5_ii(d, a, b, c, x[i+ 3], 10, -1894986606);     c = md5_ii(c, d, a, b, x[i+10], 15, -1051523);     b = md5_ii(b, c, d, a, x[i+ 1], 21, -2054922799);     a = md5_ii(a, b, c, d, x[i+ 8], 6 ,  1873313359);     d = md5_ii(d, a, b, c, x[i+15], 10, -30611744);     c = md5_ii(c, d, a, b, x[i+ 6], 15, -1560198380);     b = md5_ii(b, c, d, a, x[i+13], 21,  1309151649);     a = md5_ii(a, b, c, d, x[i+ 4], 6 , -145523070);     d = md5_ii(d, a, b, c, x[i+11], 10, -1120210379);     c = md5_ii(c, d, a, b, x[i+ 2], 15,  718787259);     b = md5_ii(b, c, d, a, x[i+ 9], 21, -343485551);    a = safe_add(a, olda);     b = safe_add(b, oldb);     c = safe_add(c, oldc);     d = safe_add(d, oldd);   }   return Array(a, b, c, d);}function md5_cmn(q, a, b, x, s, t) {   return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s),b); } function md5_ff(a, b, c, d, x, s, t) {   return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t); } function md5_gg(a, b, c, d, x, s, t) {   return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t); } function md5_hh(a, b, c, d, x, s, t) {   return md5_cmn(b ^ c ^ d, a, b, x, s, t); } function md5_ii(a, b, c, d, x, s, t) {   return md5_cmn(c ^ (b | (~d)), a, b, x, s, t); }function core_hmac_md5(key, data) {   var bkey = str2binl(key);   if(bkey.length > 16) bkey = core_md5(bkey, key.length * chrsz);var ipad = Array(16), opad = Array(16);   for(var i = 0; i < 16; i++)   {     ipad[i] = bkey[i] ^ 0x36363636;     opad[i] = bkey[i] ^ 0x5C5C5C5C;   }var hash = core_md5(ipad.concat(str2binl(data)), 512 + data.length * chrsz);   return core_md5(opad.concat(hash), 512 + 128); }function safe_add(x, y) {   var lsw = (x & 0xFFFF) + (y & 0xFFFF);   var msw = (x >> 16) + (y >> 16) + (lsw >> 16);   return (msw << 16) | (lsw & 0xFFFF); }function bit_rol(num, cnt) {   return (num << cnt) | (num >>> (32 - cnt)); }function str2binl(str) {   var bin = Array();   var mask = (1 << chrsz) - 1;   for(var i = 0; i < str.length * chrsz; i += chrsz)     bin[i>>5] |= (str.charCodeAt(i / chrsz) & mask) << (i%32);   return bin; }function binl2str(bin) {   var str = "";   var mask = (1 << chrsz) - 1;   for(var i = 0; i < bin.length * 32; i += chrsz)     str += String.fromCharCode((bin[i>>5] >>> (i % 32)) & mask);   return str; }function binl2hex(binarray) {   var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";   var str = "";   for(var i = 0; i < binarray.length * 4; i++)   {     str += hex_tab.charAt((binarray[i>>2] >> ((i%4)*8+4)) & 0xF) +            hex_tab.charAt((binarray[i>>2] >> ((i%4)*8  )) & 0xF);   }   return str; }function binl2b64(binarray) {   var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";   var str = "";   for(var i = 0; i < binarray.length * 4; i += 3)   {     var triplet = (((binarray[i   >> 2] >> 8 * ( i   %4)) & 0xFF) << 16)                 | (((binarray[i+1 >> 2] >> 8 * ((i+1)%4)) & 0xFF) << 8 )                 |  ((binarray[i+2 >> 2] >> 8 * ((i+2)%4)) & 0xFF);     for(var j = 0; j < 4; j++)     {       if(i * 8 + j * 6 > binarray.length * 32) str += b64pad;       else str += tab.charAt((triplet >> 6*(3-j)) & 0x3F);     }   }   return str; }
// prettier-ignore
function Env(t,e){"undefined"!=typeof process&&JSON.stringify(process.env).indexOf("GITHUB")>-1&&process.exit(0);class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}
