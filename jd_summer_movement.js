/**
 *  燃动夏季
 *  25 0,6-23/2 * * *
 *  脚本会助力作者百元守卫战 参数helpAuthorFlag 默认助力
 *  百元守卫战,先脚本内互助，多的助力会助力作者
 * */
const $ = new Env('燃动夏季');
const notify = $.isNode() ? require('./sendNotify') : '';
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
const helpAuthorFlag = false;//是否助力作者SH  true 助力，false 不助力
const https = require('https');
const fs = require('fs/promises');
const { R_OK } = require('fs').constants;
const vm = require('vm');
const URL = 'https://wbbny.m.jd.com/babelDiy/Zeus/2rtpffK8wqNyPBH6wyUDuBKoAbCt/index.html';
const SYNTAX_MODULE = '!function(n){var r={};function o(e){if(r[e])';
const REG_SCRIPT = /<script type="text\/javascript" src="([^><]+\/(app\.\w+\.js))\">/gm;
const REG_ENTRY = /(__webpack_require__\(__webpack_require__.s=)(\d+)(?=\)})/;
const needModuleId = 356
const DATA = {appid:'50085',sceneid:'OY217hPageh5'};
let smashUtils;
class MovementFaker {
  constructor(cookie) {this.cookie = cookie;this.ua = require('./USER_AGENTS.js').USER_AGENT;}
  async run() {if (!smashUtils) {await this.init();}
    var t = Math.floor(1e7 + 9e7 * Math.random()).toString();
    var e = smashUtils.get_risk_result({id: t,data: {random: t}}).log;
    var o = JSON.stringify({extraData: {log:  e || -1,sceneid: DATA.sceneid,},random: t});
    return o;
  }
  async init() {
    try {
      console.time('MovementFaker');process.chdir(__dirname);const html = await MovementFaker.httpGet(URL);const script = REG_SCRIPT.exec(html);
      if (script) {const [, scriptUrl, filename] = script;const jsContent = await this.getJSContent(filename, scriptUrl);const fnMock = new Function;const ctx = {window: { addEventListener: fnMock },document: {addEventListener: fnMock,removeEventListener: fnMock,cookie: this.cookie,},navigator: { userAgent: this.ua },};vm.createContext(ctx);vm.runInContext(jsContent, ctx);smashUtils = ctx.window.smashUtils;smashUtils.init(DATA);
      }
      console.timeEnd('MovementFaker');
    } catch (e) {
      console.log(e)
    }
  }
  async getJSContent(cacheKey, url) {
    try {await fs.access(cacheKey, R_OK);const rawFile = await fs.readFile(cacheKey, { encoding: 'utf8' });return rawFile;
    } catch (e) {
      let jsContent = await MovementFaker.httpGet(url);
      const moduleIndex = jsContent.indexOf(SYNTAX_MODULE, 1);
      const findEntry = REG_ENTRY.test(jsContent);
      if (!(moduleIndex && findEntry)) {
        throw new Error('Module not found.');
      }
      jsContent = jsContent.replace(REG_ENTRY, `$1${needModuleId}`);
      fs.writeFile(cacheKey, jsContent);
      return jsContent;
      REG_ENTRY.lastIndex = 0;
      const entry = REG_ENTRY.exec(jsContent);
    }
  }
  static httpGet(url) {
    return new Promise((resolve, reject) => {
      const protocol = url.indexOf('http') !== 0 ? 'https:' : '';
      const req = https.get(protocol + url, (res) => {res.setEncoding('utf-8');let rawData = '';res.on('error', reject);res.on('data', chunk => rawData += chunk);res.on('end', () => resolve(rawData));});
      req.on('error', reject);
      req.end();
    });
  }
}

$.inviteList = [];
$.byInviteList = [];
let uuid = 8888;
let cookiesArr = [];
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

  console.log(`注意：若执行失败，则请进入环境手动删除“app.5c2472d1.js”文件，然后重新执行脚本`);
  console.log(`若找不到“app.5c2472d1.js”文件，则删除“app”开头的解密文件`);
  // try{
  //   nods(process.cwd());
  // }catch (e) {
  //
  // }

  for (let i = 0; i < cookiesArr.length; i++) {
    if (cookiesArr[i]) {
      $.cookie = cookiesArr[i];
      uuid = getUUID();
      $.UserName = decodeURIComponent($.cookie.match(/pt_pin=([^; ]+)(?=;?)/) && $.cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1]);
      $.index = i + 1;
      $.isLogin = true;
      $.nickName = $.UserName;
      await TotalBean();
      console.log(`\n*****开始【京东账号${$.index}】${$.nickName || $.UserName}*****\n`);
      console.log(`\n如有未完成的任务，请多执行几次\n`);
      if (!$.isLogin) {
        $.msg($.name, `【提示】cookie已失效`, `京东账号${$.index} ${$.nickName || $.UserName}\n请重新登录获取\nhttps://bean.m.jd.com/bean/signIndex.action`, {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});
        if ($.isNode()) {
          await notify.sendNotify(`${$.name}cookie已失效 - ${$.UserName}`, `京东账号${$.index} ${$.UserName}\n请重新登录获取cookie`);
        }
        continue
      }
      try {
        await main();
      }catch (e) {
        console.log(JSON.stringify(e));
        console.log(JSON.stringify(e.message));
      }
    }
  }

  let res = [],res2 = [];
  // if(helpAuthorFlag){
  //   try{
  //     res = await getAuthorShareCode('http://cdn.trueorfalse.top/392b03aabdb848d0b7e5ae499ef24e35/');
  //     res2 = await getAuthorShareCode(`https://cdn.jsdelivr.net/gh/gitupdate/updateTeam@master/shareCodes/jd_zoo.json?${new Date()}`);
  //   }catch (e) {}
  //   if(!res){res = [];}
  //   if(!res2){res2 = [];}
  // }
  let allCodeList = getRandomArrayElements([ ...res, ...res2],[ ...res, ...res2].length);
  allCodeList=[...$.byInviteList,...allCodeList];
  if(allCodeList.length >0){
    console.log(`\n******开始助力百元守卫战*********\n`);
    for (let i = 0; i < cookiesArr.length; i++) {
      $.cookie = cookiesArr[i];
      $.canHelp = true;
      $.UserName = decodeURIComponent($.cookie.match(/pt_pin=([^; ]+)(?=;?)/) && $.cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1]);
      for (let i = 0; i < allCodeList.length && $.canHelp; i++) {
        $.inviteId = allCodeList[i];
        console.log(`${$.UserName} 去助力 ${$.inviteId}`);
        await takePostRequest('byHelp');
        await $.wait(1000);
      }
    }
  }
  if ($.inviteList.length > 0) console.log(`\n******开始内部京东账号【邀请好友助力】*********\n`);
  for (let i = 0; i < cookiesArr.length; i++) {
    $.cookie = cookiesArr[i];
    $.canHelp = true;
    $.UserName = decodeURIComponent($.cookie.match(/pt_pin=([^; ]+)(?=;?)/) && $.cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1]);
    $.index = i + 1;
    for (let j = 0; j < $.inviteList.length && $.canHelp; j++) {
      $.oneInviteInfo = $.inviteList[j];
      if ($.oneInviteInfo.ues === $.UserName || $.oneInviteInfo.max) {
        continue;
      }
      $.inviteId = $.oneInviteInfo.inviteId;
      console.log(`${$.UserName}去助力${$.oneInviteInfo.ues},助力码${$.inviteId}`);
      await takePostRequest('help');
      await $.wait(2000);
    }
  }
  try{
    nods(process.cwd());
  }catch (e) {

  }
})().catch((e) => {$.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')}).finally(() => {$.done();})


async function main(){
  $.homeData = {};
  $.taskList = [];
  await takePostRequest('olympicgames_home');
  $.userInfo =$.homeData.result.userActBaseInfo
  console.log(`\n待兑换金额：${Number($.userInfo.poolMoney)} 当前等级:${$.userInfo.medalLevel} \n`);
  await $.wait(1000);
  if($.userInfo &&  $.userInfo.sex !== 1 && $.userInfo.sex !== 0){
    await takePostRequest('olympicgames_tiroGuide');
    await $.wait(1000);
  }
  console.log('获取百元守卫战信息')
  $.guradHome = {};
  await takePostRequest('olypicgames_guradHome');
  await $.wait(2000);
  if (Number($.userInfo.poolCurrency) >= Number($.userInfo.exchangeThreshold)) {
    console.log(`满足升级条件，去升级`);
    await $.wait(1000);
    await takePostRequest('olympicgames_receiveCash');
  }
  if($.homeData.result.trainingInfo.state === 0 && !$.homeData.result.trainingInfo.finishFlag){
    console.log(`开始运动`)
    await takePostRequest('olympicgames_startTraining');
  }else if($.homeData.result.trainingInfo.state === 0 && $.homeData.result.trainingInfo.finishFlag){
    console.log(`已完成今日运动`)
  }
  bubbleInfos = $.homeData.result.bubbleInfos;
  let runFlag = false;
  for(let item of bubbleInfos){
    if(item.type != 7){
      $.collectId = item.type
      await takePostRequest('olympicgames_collectCurrency');
      await $.wait(1000);
      runFlag = true;
    }
  }
  if(runFlag) {
    await takePostRequest('olympicgames_home');
    $.userInfo =$.homeData.result.userActBaseInfo;
  }
  if (runFlag && Number($.userInfo.poolCurrency) >= Number($.userInfo.exchangeThreshold)) {
    console.log(`满足升级条件，去升级`);
    await $.wait(1000);
    await takePostRequest('olympicgames_receiveCash');
  }
  await $.wait(1000);
  await takePostRequest('olympicgames_getTaskDetail');
  await $.wait(1000);
  console.log(`开始做任务`)
  await doTask();
  await $.wait(1000);
  console.log(`开始做微信端任务`)
  await takePostRequest('wxTaskDetail');
  await $.wait(1000)
  await doTask();

}

async function getBody($) {const zf = new MovementFaker($.cookie);const ss = await zf.run();return ss;}

async function doTask(){
  //做任务
  for (let i = 0; i < $.taskList.length; i++) {
    $.oneTask = $.taskList[i];
    if ([1, 3, 5, 7, 9, 26].includes($.oneTask.taskType) && $.oneTask.status === 1) {
      $.activityInfoList = $.oneTask.shoppingActivityVos || $.oneTask.brandMemberVos || $.oneTask.followShopVo || $.oneTask.browseShopVo;
      for (let j = 0; j < $.activityInfoList.length; j++) {
        $.oneActivityInfo = $.activityInfoList[j];
        if ($.oneActivityInfo.status !== 1 || !$.oneActivityInfo.taskToken) {
          continue;
        }
        $.callbackInfo = {};
        console.log(`做任务：${$.oneActivityInfo.title || $.oneActivityInfo.taskName || $.oneActivityInfo.shopName};等待完成`);
        await takePostRequest('olympicgames_doTaskDetail');
        if ($.callbackInfo.code === 0 && $.callbackInfo.data && $.callbackInfo.data.result && $.callbackInfo.data.result.taskToken) {
          console.log(`等待8秒`);
          await $.wait(8000);
          let sendInfo = encodeURIComponent(`{"dataSource":"newshortAward","method":"getTaskAward","reqParams":"{\\"taskToken\\":\\"${$.callbackInfo.data.result.taskToken}\\"}","sdkVersion":"1.0.0","clientLanguage":"zh"}`)
          await callbackResult(sendInfo)
        } else if ($.oneTask.taskType === 5 || $.oneTask.taskType === 3 || $.oneTask.taskType === 26) {
          await $.wait(2000);
          console.log(`任务完成`);
        } else {
          console.log($.callbackInfo);
          console.log(`任务失败`);
          await $.wait(3000);
        }
      }
    } else if ($.oneTask.taskType === 2 && $.oneTask.status === 1 && $.oneTask.scoreRuleVos[0].scoreRuleType === 2){
      console.log(`做任务：${$.oneTask.taskName};等待完成 (实际不会添加到购物车)`);
      $.taskId = $.oneTask.taskId;
      $.feedDetailInfo = {};
      await takePostRequest('olympicgames_getFeedDetail');
      let productList = $.feedDetailInfo.productInfoVos;
      let needTime = Number($.feedDetailInfo.maxTimes) - Number($.feedDetailInfo.times);
      for (let j = 0; j < productList.length && needTime > 0; j++) {
        if(productList[j].status !== 1){
          continue;
        }
        $.taskToken = productList[j].taskToken;
        console.log(`加购：${productList[j].skuName}`);
        await takePostRequest('add_car');
        await $.wait(1500);
        needTime --;
      }
    }else if ($.oneTask.taskType === 2 && $.oneTask.status === 1 && $.oneTask.scoreRuleVos[0].scoreRuleType === 0){
      $.activityInfoList = $.oneTask.productInfoVos ;
      for (let j = 0; j < $.activityInfoList.length; j++) {
        $.oneActivityInfo = $.activityInfoList[j];
        if ($.oneActivityInfo.status !== 1 || !$.oneActivityInfo.taskToken) {
          continue;
        }
        $.callbackInfo = {};
        console.log(`做任务：浏览${$.oneActivityInfo.skuName};等待完成`);
        await takePostRequest('olympicgames_doTaskDetail');
        if ($.oneTask.taskType === 2) {
          await $.wait(2000);
          console.log(`任务完成`);
        } else {
          console.log($.callbackInfo);
          console.log(`任务失败`);
          await $.wait(3000);
        }
      }
    }else if($.oneTask.status !== 1){
      console.log(`任务：${$.oneTask.taskName}，已完成`);
    }else{
      console.log(`任务：${$.oneTask.taskName}，不执行`);
    }
  }
}

async function takePostRequest(type) {
  let body = ``;
  let myRequest = ``;
  switch (type) {
    case 'olympicgames_home':
      body = `functionId=olympicgames_home&body={}&client=wh5&clientVersion=1.0.0&uuid=${uuid}&appid=o2_act`;
      myRequest = await getPostRequest(body);
      break;
    case 'olympicgames_receiveCash':
      body = `functionId=olympicgames_receiveCash&body={"type":6}&client=wh5&clientVersion=1.0.0&uuid=${uuid}&appid=o2_act`;
      myRequest = await getPostRequest(body);
      break
    case 'olympicgames_getTaskDetail':
      body = `functionId=olympicgames_getTaskDetail&body={"taskId":"","appSign":"1"}&client=wh5&clientVersion=1.0.0&uuid=${uuid}&appid=o2_act`;
      myRequest = await getPostRequest(body);
      break
    case 'olympicgames_doTaskDetail':
      body = await getPostBody(type);
      myRequest = await getPostRequest(body);
      break;
    case 'olympicgames_getFeedDetail':
      body = `functionId=olympicgames_getFeedDetail&body={"taskId":"${$.taskId}"}&client=wh5&clientVersion=1.0.0&uuid=${uuid}&appid=o2_act`;
      myRequest = await getPostRequest(body);
      break;
    case 'wxTaskDetail':
      body = `functionId=olympicgames_getTaskDetail&body={"taskId":"","appSign":"2"}&client=wh5&clientVersion=1.0.0&uuid=${uuid}&appid=o2_act`;
      myRequest = await getPostRequest(body);
      break
    case 'olympicgames_collectCurrency':
      body = await getPostBody(type);
      myRequest = await getPostRequest(body);
      break
    case 'add_car':
      body = await getPostBody(type);
      myRequest = await getPostRequest(body);
      break;
    case 'help':
    case 'byHelp':
      body = await getPostBody(type);
      myRequest = await getPostRequest( body);
      break;
    case 'olympicgames_startTraining':
      body = await getPostBody(type);
      myRequest = await getPostRequest( body);
      break;
    case 'olypicgames_guradHome':
      body = `functionId=olypicgames_guradHome&body={}&client=wh5&clientVersion=1.0.0&uuid=${uuid}&appid=o2_act`;
      myRequest = await getPostRequest( body);
      break
    case 'olympicgames_tiroGuide':
      body = `functionId=olympicgames_tiroGuide&body={"sex":1,"sportsGoal":2}&client=wh5&clientVersion=1.0.0&uuid=${uuid}&appid=${$.appid}`;
      myRequest = await getPostRequest(body);
      break;
    default:
      console.log(`错误${type}`);
  }
  if( type === 'add_car' ){
    myRequest['url'] = `https://api.m.jd.com/client.action?advId=olympicgames_doTaskDetail`;
  }else if( type === 'help' ||  type === 'byHelp'){
    myRequest['url'] = `https://api.m.jd.com/client.action?advId=olympicgames_assist`;
  }else if( type === 'wxTaskDetail'){
    myRequest['url'] = `https://api.m.jd.com/client.action?advId=olympicgames_getTaskDetail`;
  }else{
    myRequest['url'] = `https://api.m.jd.com/client.action?advId=${type}`;
  }
  return new Promise(async resolve => {
    $.post(myRequest, (err, resp, data) => {
      try {
        //console.log(data);
        dealReturn(type, data);
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
}

async function dealReturn(type, data) {
  try {
    data = JSON.parse(data);
  } catch (e) {
    console.log(`返回异常：${data}`);
    return;
  }
  switch (type) {
    case 'olympicgames_home':
      if (data.code === 0) {
        if (data.data['bizCode'] === 0) {
          $.homeData = data.data;
        }
      }
      break;
    case 'olympicgames_receiveCash':
      if (data.code === 0 && data.data && data.data.result) {
        console.log('升级成功')
        // if(data.data.result.couponVO){
        //   let res = data.data.result.couponVO
        //   console.log(`获得[${res.couponName}]优惠券：${res.usageThreshold} 优惠：${res.quota} 时间：${res.useTimeRange}`);
        // }
      }else{
        //console.log(JSON.stringify(data));
      }
      console.log(JSON.stringify(data));
      break;
    case 'olympicgames_getTaskDetail':
      if (data.code === 0 && data.data.result) {
        console.log(`互助码：${data.data.result.inviteId || '助力已满，获取助力码失败'}`);
        if (data.data.result.inviteId) {
          $.inviteList.push({
            'ues': $.UserName,
            'inviteId': data.data.result.inviteId,
            'max': false
          });
        }
        $.taskList =  data.data.result.taskVos || [];
      }else{
        console.log(JSON.stringify(data));
      }
      break;
    case 'wxTaskDetail':
      if (data.code === 0 && data.data.result) {
        $.taskList =  data.data.result.taskVos || [];
      }else{
        console.log(JSON.stringify(data));
      }
      break;
    case 'olympicgames_getFeedDetail':
      if (data.code === 0) {
        $.feedDetailInfo = data.data.result.addProductVos[0] || [];
      }
      break;
    case 'olympicgames_doTaskDetail':
      $.callbackInfo = data;
      break;
    case 'add_car':
      if (data.code === 0) {
        if(data.data && data.data.result && data.data.result.acquiredScore){
          let acquiredScore = data.data.result.acquiredScore;
          if(Number(acquiredScore) > 0){
            console.log(`加购成功,获得金币:${acquiredScore}`);
          }else{
            console.log(`加购成功`);
          }
        }else{
          console.log(JSON.stringify(data));
        }
      }else{
        console.log(`加购失败`);
        console.log(JSON.stringify(data));
      }
      break
    case 'help':
    case 'byHelp':
      if(data.data && data.data.bizCode === 0){
        if(data.data.result.hongBaoVO && data.data.result.hongBaoVO.withdrawCash){
          console.log(`助力成功`);
        }
      }else if(data.data && data.data.bizMsg){
        if(data.data.bizCode === -405 || data.data.bizCode === -411){
          $.canHelp = false;
        }
        if(data.data.bizCode === -404 && $.oneInviteInfo){
          $.oneInviteInfo.max = true;
        }
        console.log(data.data.bizMsg);
      }else{
        console.log(JSON.stringify(data));
      }
      //console.log(`助力结果\n${JSON.stringify(data)}`)
      break;
    case 'olympicgames_collectCurrency':
      if (data.code === 0 && data.data && data.data.result) {
        console.log(`收取成功，获得：${data.data.result.poolCurrency}`);
      }else{
        console.log(JSON.stringify(data));
      }
      break;
    case 'olympicgames_startTraining':
      if (data.code === 0 && data.data && data.data.result) {
        console.log(`执行运动成功`);
      }else{
        console.log(JSON.stringify(data));
      }
      break;
    case 'olypicgames_guradHome':
      //console.log(JSON.stringify(data));
      if (data.data && data.data.result && data.data.bizCode === 0) {
        console.log(`百元守卫战互助码：${ data.data.result.inviteId || '助力已满，获取助力码失败'}`);
        $.guradHome = data.data;
        if(data.data.result.inviteId && Number(data.data.result.activityLeftSeconds)> 0){
          $.byInviteList.push(data.data.result.inviteId)
        }else if(Number(data.data.result.activityLeftSeconds) === 0){
          console.log(`百元守卫时间已结束`);
        }
      }else if (data.data && data.data.bizCode === 1103) {
        console.log(`百元守卫时间已结束,已领取奖励`);
      }else {
        console.log(JSON.stringify(data));
      }
      break;
    case 'olympicgames_tiroGuide':
      console.log(JSON.stringify(data));
      break
    default:
      console.log(`未判断的异常${type}`);
  }
}
//领取奖励
function callbackResult(info) {
  return new Promise((resolve) => {
    let url = {
      url: `https://api.m.jd.com/?functionId=qryViewkitCallbackResult&client=wh5&clientVersion=1.0.0&body=${info}&_timestamp=` + Date.now(),
      headers: {
        'Origin': `https://bunearth.m.jd.com`,
        'Cookie': $.cookie,
        'Connection': `keep-alive`,
        'Accept': `*/*`,
        'Host': `api.m.jd.com`,
        'User-Agent': $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
        'Accept-Encoding': `gzip, deflate, br`,
        'Accept-Language': `zh-cn`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Referer': 'https://bunearth.m.jd.com'
      }
    }

    $.get(url, async (err, resp, data) => {
      try {
        data = JSON.parse(data);
        console.log(data.toast.subTitle)
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve()
      }
    })
  })
}

async function getPostRequest(body) {
  const method = `POST`;
  const headers = {
    "Accept": "application/json",
    "Accept-Encoding": "gzip, deflgetPostRequestate, br",
    "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
    "Connection": "keep-alive",
    "Content-Type": "application/x-www-form-urlencoded",
    'Cookie': $.cookie,
    "Origin": "https://wbbny.m.jd.com",
    "Referer": "https://wbbny.m.jd.com/",
    'User-Agent': $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
  };
  return { method: method, headers: headers, body: body};
}

async function getPostBody(type) {
  return new Promise(async resolve => {
    let taskBody = '';
    try {
      const log = await getBody($);
      if (type === 'help' || type === 'byHelp') {
        taskBody = `functionId=olympicgames_assist&body=${JSON.stringify({"inviteId":$.inviteId,"type": "confirm","ss" :log})}&client=wh5&clientVersion=1.0.0&uuid=${uuid}&appid=o2_act`
      } else if (type === 'olympicgames_collectCurrency') {
        taskBody = `functionId=olympicgames_collectCurrency&body=${JSON.stringify({"type":$.collectId,"ss" : log})}&client=wh5&clientVersion=1.0.0&uuid=${uuid}&appid=o2_act`;
      } else if(type === 'add_car'){
        taskBody = `functionId=olympicgames_doTaskDetail&body=${JSON.stringify({"taskId": $.taskId,"taskToken":$.taskToken,"ss" : log})}&client=wh5&clientVersion=1.0.0&uuid=${uuid}&appid=o2_act`
      }else if(type === 'olympicgames_startTraining'){
        taskBody = `functionId=olympicgames_startTraining&body=${JSON.stringify({"ss" : log})}&client=wh5&clientVersion=1.0.0&uuid=${uuid}&appid=o2_act`
      }else{
        taskBody = `functionId=${type}&body=${JSON.stringify({"taskId": $.oneTask.taskId,"actionType":1,"taskToken" : $.oneActivityInfo.taskToken,"ss" : log})}&client=wh5&clientVersion=1.0.0&uuid=${uuid}&appid=o2_act`
      }
      //console.log(taskBody)
    } catch (e) {
      $.logErr(e)
    } finally {
      resolve(taskBody);
    }
  })
}
function getUUID() {
  var n = (new Date).getTime();
  let uuid="xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx"
  uuid = uuid.replace(/[xy]/g, function (e) {
    var t = (n + 16 * Math.random()) % 16 | 0;
    return n = Math.floor(n / 16),
      ("x" == e ? t : 3 & t | 8).toString(16)
  }).replace(/-/g, "")
  return uuid
}
/**
 * 随机从一数组里面取
 * @param arr
 * @param count
 * @returns {Buffer}
 */
function getRandomArrayElements(arr, count) {
  var shuffled = arr.slice(0), i = arr.length, min = i - count, temp, index;
  while (i-- > min) {
    index = Math.floor((i + 1) * Math.random());
    temp = shuffled[index];
    shuffled[index] = shuffled[i];
    shuffled[i] = temp;
  }
  return shuffled.slice(min);
}
function getAuthorShareCode(url) {
  return new Promise(async resolve => {
    const options = {
      "url": `${url}`,
      "timeout": 10000,
      "headers": {
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1 Edg/87.0.4280.88"
      }
    };
    if ($.isNode() && process.env.TG_PROXY_HOST && process.env.TG_PROXY_PORT) {
      const tunnel = require("tunnel");
      const agent = {
        https: tunnel.httpsOverHttp({
          proxy: {
            host: process.env.TG_PROXY_HOST,
            port: process.env.TG_PROXY_PORT * 1
          }
        })
      }
      Object.assign(options, { agent })
    }
    $.get(options, async (err, resp, data) => {
      try {
        if (err) {
        } else {
          if (data) data = JSON.parse(data)
        }
      } catch (e) {
        // $.logErr(e, resp)
      } finally {
        resolve(data || []);
      }
    })
    await $.wait(10000)
    resolve();
  })
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
function nods(dir) {
  try {
    const fs = require('fs');
    const stat = fs.stat;
    const path = require('path');
    if (fs.existsSync(dir)) {
      fs.readdir(dir, function(err, files) {
        files.forEach(function(filename) {
          const src = path.join(dir, filename)
          stat(src, function (err, st) {
            if (err) { throw err; }
            // 判断是否为文件
            if (st.isFile()) {
              if (/^app\.[0-9a-z]+\.js/.test(filename)) {
                fs.unlink(src, (err) => {
                  if (err) throw err;
                  console.log('成功删除文件: ' + src);
                });
              }
            } else {
              // 递归作为文件夹处理
              nods(src);
            }
          });
        });
      });
    } else {
      console.log("给定的路径不存在，请给出正确的路径");
    }
  } catch (e) {
    console.log(e)
  }
}
// prettier-ignore
function Env(name, opts) {
  class Http {
    constructor(env) {
      this.env = env
    }

    send(opts, method = 'GET') {
      opts = typeof opts === 'string' ? { url: opts } : opts
      let sender = this.get
      if (method === 'POST') {
        sender = this.post
      }
      return new Promise((resolve, reject) => {
        sender.call(this, opts, (err, resp, body) => {
          if (err) reject(err)
          else resolve(resp)
        })
      })
    }

    get(opts) {
      return this.send.call(this.env, opts)
    }

    post(opts) {
      return this.send.call(this.env, opts, 'POST')
    }
  }

  return new (class {
    constructor(name, opts) {
      this.name = name
      this.http = new Http(this)
      this.data = null
      this.dataFile = 'box.dat'
      this.logs = []
      this.isMute = false
      this.isNeedRewrite = false
      this.logSeparator = '\n'
      this.startTime = new Date().getTime()
      Object.assign(this, opts)
      this.log('', `🔔${this.name}, 开始!`)
    }

    isNode() {
      return 'undefined' !== typeof module && !!module.exports
    }

    isQuanX() {
      return 'undefined' !== typeof $task
    }

    isSurge() {
      return 'undefined' !== typeof $httpClient && 'undefined' === typeof $loon
    }

    isLoon() {
      return 'undefined' !== typeof $loon
    }

    isShadowrocket() {
      return 'undefined' !== typeof $rocket
    }

    toObj(str, defaultValue = null) {
      try {
        return JSON.parse(str)
      } catch {
        return defaultValue
      }
    }

    toStr(obj, defaultValue = null) {
      try {
        return JSON.stringify(obj)
      } catch {
        return defaultValue
      }
    }

    getjson(key, defaultValue) {
      let json = defaultValue
      const val = this.getdata(key)
      if (val) {
        try {
          json = JSON.parse(this.getdata(key))
        } catch {}
      }
      return json
    }

    setjson(val, key) {
      try {
        return this.setdata(JSON.stringify(val), key)
      } catch {
        return false
      }
    }

    getScript(url) {
      return new Promise((resolve) => {
        this.get({ url }, (err, resp, body) => resolve(body))
      })
    }

    runScript(script, runOpts) {
      return new Promise((resolve) => {
        let httpapi = this.getdata('@chavy_boxjs_userCfgs.httpapi')
        httpapi = httpapi ? httpapi.replace(/\n/g, '').trim() : httpapi
        let httpapi_timeout = this.getdata('@chavy_boxjs_userCfgs.httpapi_timeout')
        httpapi_timeout = httpapi_timeout ? httpapi_timeout * 1 : 20
        httpapi_timeout = runOpts && runOpts.timeout ? runOpts.timeout : httpapi_timeout
        const [key, addr] = httpapi.split('@')
        const opts = {
          url: `http://${addr}/v1/scripting/evaluate`,
          body: { script_text: script, mock_type: 'cron', timeout: httpapi_timeout },
          headers: { 'X-Key': key, 'Accept': '*/*' }
        }
        this.post(opts, (err, resp, body) => resolve(body))
      }).catch((e) => this.logErr(e))
    }

    loaddata() {
      if (this.isNode()) {
        this.fs = this.fs ? this.fs : require('fs')
        this.path = this.path ? this.path : require('path')
        const curDirDataFilePath = this.path.resolve(this.dataFile)
        const rootDirDataFilePath = this.path.resolve(process.cwd(), this.dataFile)
        const isCurDirDataFile = this.fs.existsSync(curDirDataFilePath)
        const isRootDirDataFile = !isCurDirDataFile && this.fs.existsSync(rootDirDataFilePath)
        if (isCurDirDataFile || isRootDirDataFile) {
          const datPath = isCurDirDataFile ? curDirDataFilePath : rootDirDataFilePath
          try {
            return JSON.parse(this.fs.readFileSync(datPath))
          } catch (e) {
            return {}
          }
        } else return {}
      } else return {}
    }

    writedata() {
      if (this.isNode()) {
        this.fs = this.fs ? this.fs : require('fs')
        this.path = this.path ? this.path : require('path')
        const curDirDataFilePath = this.path.resolve(this.dataFile)
        const rootDirDataFilePath = this.path.resolve(process.cwd(), this.dataFile)
        const isCurDirDataFile = this.fs.existsSync(curDirDataFilePath)
        const isRootDirDataFile = !isCurDirDataFile && this.fs.existsSync(rootDirDataFilePath)
        const jsondata = JSON.stringify(this.data)
        if (isCurDirDataFile) {
          this.fs.writeFileSync(curDirDataFilePath, jsondata)
        } else if (isRootDirDataFile) {
          this.fs.writeFileSync(rootDirDataFilePath, jsondata)
        } else {
          this.fs.writeFileSync(curDirDataFilePath, jsondata)
        }
      }
    }

    lodash_get(source, path, defaultValue = undefined) {
      const paths = path.replace(/\[(\d+)\]/g, '.$1').split('.')
      let result = source
      for (const p of paths) {
        result = Object(result)[p]
        if (result === undefined) {
          return defaultValue
        }
      }
      return result
    }

    lodash_set(obj, path, value) {
      if (Object(obj) !== obj) return obj
      if (!Array.isArray(path)) path = path.toString().match(/[^.[\]]+/g) || []
      path
        .slice(0, -1)
        .reduce((a, c, i) => (Object(a[c]) === a[c] ? a[c] : (a[c] = Math.abs(path[i + 1]) >> 0 === +path[i + 1] ? [] : {})), obj)[
        path[path.length - 1]
      ] = value
      return obj
    }

    getdata(key) {
      let val = this.getval(key)
      // 如果以 @
      if (/^@/.test(key)) {
        const [, objkey, paths] = /^@(.*?)\.(.*?)$/.exec(key)
        const objval = objkey ? this.getval(objkey) : ''
        if (objval) {
          try {
            const objedval = JSON.parse(objval)
            val = objedval ? this.lodash_get(objedval, paths, '') : val
          } catch (e) {
            val = ''
          }
        }
      }
      return val
    }

    setdata(val, key) {
      let issuc = false
      if (/^@/.test(key)) {
        const [, objkey, paths] = /^@(.*?)\.(.*?)$/.exec(key)
        const objdat = this.getval(objkey)
        const objval = objkey ? (objdat === 'null' ? null : objdat || '{}') : '{}'
        try {
          const objedval = JSON.parse(objval)
          this.lodash_set(objedval, paths, val)
          issuc = this.setval(JSON.stringify(objedval), objkey)
        } catch (e) {
          const objedval = {}
          this.lodash_set(objedval, paths, val)
          issuc = this.setval(JSON.stringify(objedval), objkey)
        }
      } else {
        issuc = this.setval(val, key)
      }
      return issuc
    }

    getval(key) {
      if (this.isSurge() || this.isLoon()) {
        return $persistentStore.read(key)
      } else if (this.isQuanX()) {
        return $prefs.valueForKey(key)
      } else if (this.isNode()) {
        this.data = this.loaddata()
        return this.data[key]
      } else {
        return (this.data && this.data[key]) || null
      }
    }

    setval(val, key) {
      if (this.isSurge() || this.isLoon()) {
        return $persistentStore.write(val, key)
      } else if (this.isQuanX()) {
        return $prefs.setValueForKey(val, key)
      } else if (this.isNode()) {
        this.data = this.loaddata()
        this.data[key] = val
        this.writedata()
        return true
      } else {
        return (this.data && this.data[key]) || null
      }
    }

    initGotEnv(opts) {
      this.got = this.got ? this.got : require('got')
      this.cktough = this.cktough ? this.cktough : require('tough-cookie')
      this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar()
      if (opts) {
        opts.headers = opts.headers ? opts.headers : {}
        if (undefined === opts.headers.Cookie && undefined === opts.cookieJar) {
          opts.cookieJar = this.ckjar
        }
      }
    }

    get(opts, callback = () => {}) {
      if (opts.headers) {
        delete opts.headers['Content-Type']
        delete opts.headers['Content-Length']
      }
      if (this.isSurge() || this.isLoon()) {
        if (this.isSurge() && this.isNeedRewrite) {
          opts.headers = opts.headers || {}
          Object.assign(opts.headers, { 'X-Surge-Skip-Scripting': false })
        }
        $httpClient.get(opts, (err, resp, body) => {
          if (!err && resp) {
            resp.body = body
            resp.statusCode = resp.status
          }
          callback(err, resp, body)
        })
      } else if (this.isQuanX()) {
        if (this.isNeedRewrite) {
          opts.opts = opts.opts || {}
          Object.assign(opts.opts, { hints: false })
        }
        $task.fetch(opts).then(
          (resp) => {
            const { statusCode: status, statusCode, headers, body } = resp
            callback(null, { status, statusCode, headers, body }, body)
          },
          (err) => callback(err)
        )
      } else if (this.isNode()) {
        this.initGotEnv(opts)
        this.got(opts)
          .on('redirect', (resp, nextOpts) => {
            try {
              if (resp.headers['set-cookie']) {
                const ck = resp.headers['set-cookie'].map(this.cktough.Cookie.parse).toString()
                if (ck) {
                  this.ckjar.setCookieSync(ck, null)
                }
                nextOpts.cookieJar = this.ckjar
              }
            } catch (e) {
              this.logErr(e)
            }
            // this.ckjar.setCookieSync(resp.headers['set-cookie'].map(Cookie.parse).toString())
          })
          .then(
            (resp) => {
              const { statusCode: status, statusCode, headers, body } = resp
              callback(null, { status, statusCode, headers, body }, body)
            },
            (err) => {
              const { message: error, response: resp } = err
              callback(error, resp, resp && resp.body)
            }
          )
      }
    }

    post(opts, callback = () => {}) {
      const method = opts.method ? opts.method.toLocaleLowerCase() : 'post'
      // 如果指定了请求体, 但没指定`Content-Type`, 则自动生成
      if (opts.body && opts.headers && !opts.headers['Content-Type']) {
        opts.headers['Content-Type'] = 'application/x-www-form-urlencoded'
      }
      if (opts.headers) delete opts.headers['Content-Length']
      if (this.isSurge() || this.isLoon()) {
        if (this.isSurge() && this.isNeedRewrite) {
          opts.headers = opts.headers || {}
          Object.assign(opts.headers, { 'X-Surge-Skip-Scripting': false })
        }
        $httpClient[method](opts, (err, resp, body) => {
          if (!err && resp) {
            resp.body = body
            resp.statusCode = resp.status
          }
          callback(err, resp, body)
        })
      } else if (this.isQuanX()) {
        opts.method = method
        if (this.isNeedRewrite) {
          opts.opts = opts.opts || {}
          Object.assign(opts.opts, { hints: false })
        }
        $task.fetch(opts).then(
          (resp) => {
            const { statusCode: status, statusCode, headers, body } = resp
            callback(null, { status, statusCode, headers, body }, body)
          },
          (err) => callback(err)
        )
      } else if (this.isNode()) {
        this.initGotEnv(opts)
        const { url, ..._opts } = opts
        this.got[method](url, _opts).then(
          (resp) => {
            const { statusCode: status, statusCode, headers, body } = resp
            callback(null, { status, statusCode, headers, body }, body)
          },
          (err) => {
            const { message: error, response: resp } = err
            callback(error, resp, resp && resp.body)
          }
        )
      }
    }
    /**
     *
     * 示例:$.time('yyyy-MM-dd qq HH:mm:ss.S')
     *    :$.time('yyyyMMddHHmmssS')
     *    y:年 M:月 d:日 q:季 H:时 m:分 s:秒 S:毫秒
     *    其中y可选0-4位占位符、S可选0-1位占位符，其余可选0-2位占位符
     * @param {string} fmt 格式化参数
     * @param {number} 可选: 根据指定时间戳返回格式化日期
     *
     */
    time(fmt, ts = null) {
      const date = ts ? new Date(ts) : new Date()
      let o = {
        'M+': date.getMonth() + 1,
        'd+': date.getDate(),
        'H+': date.getHours(),
        'm+': date.getMinutes(),
        's+': date.getSeconds(),
        'q+': Math.floor((date.getMonth() + 3) / 3),
        'S': date.getMilliseconds()
      }
      if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
      for (let k in o)
        if (new RegExp('(' + k + ')').test(fmt))
          fmt = fmt.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length))
      return fmt
    }

    /**
     * 系统通知
     *
     * > 通知参数: 同时支持 QuanX 和 Loon 两种格式, EnvJs根据运行环境自动转换, Surge 环境不支持多媒体通知
     *
     * 示例:
     * $.msg(title, subt, desc, 'twitter://')
     * $.msg(title, subt, desc, { 'open-url': 'twitter://', 'media-url': 'https://github.githubassets.com/images/modules/open_graph/github-mark.png' })
     * $.msg(title, subt, desc, { 'open-url': 'https://bing.com', 'media-url': 'https://github.githubassets.com/images/modules/open_graph/github-mark.png' })
     *
     * @param {*} title 标题
     * @param {*} subt 副标题
     * @param {*} desc 通知详情
     * @param {*} opts 通知参数
     *
     */
    msg(title = name, subt = '', desc = '', opts) {
      const toEnvOpts = (rawopts) => {
        if (!rawopts) return rawopts
        if (typeof rawopts === 'string') {
          if (this.isLoon()) return rawopts
          else if (this.isQuanX()) return { 'open-url': rawopts }
          else if (this.isSurge()) return { url: rawopts }
          else return undefined
        } else if (typeof rawopts === 'object') {
          if (this.isLoon()) {
            let openUrl = rawopts.openUrl || rawopts.url || rawopts['open-url']
            let mediaUrl = rawopts.mediaUrl || rawopts['media-url']
            return { openUrl, mediaUrl }
          } else if (this.isQuanX()) {
            let openUrl = rawopts['open-url'] || rawopts.url || rawopts.openUrl
            let mediaUrl = rawopts['media-url'] || rawopts.mediaUrl
            return { 'open-url': openUrl, 'media-url': mediaUrl }
          } else if (this.isSurge()) {
            let openUrl = rawopts.url || rawopts.openUrl || rawopts['open-url']
            return { url: openUrl }
          }
        } else {
          return undefined
        }
      }
      if (!this.isMute) {
        if (this.isSurge() || this.isLoon()) {
          $notification.post(title, subt, desc, toEnvOpts(opts))
        } else if (this.isQuanX()) {
          $notify(title, subt, desc, toEnvOpts(opts))
        }
      }
      if (!this.isMuteLog) {
        let logs = ['', '==============📣系统通知📣==============']
        logs.push(title)
        subt ? logs.push(subt) : ''
        desc ? logs.push(desc) : ''
        console.log(logs.join('\n'))
        this.logs = this.logs.concat(logs)
      }
    }

    log(...logs) {
      if (logs.length > 0) {
        this.logs = [...this.logs, ...logs]
      }
      console.log(logs.join(this.logSeparator))
    }

    logErr(err, msg) {
      const isPrintSack = !this.isSurge() && !this.isQuanX() && !this.isLoon()
      if (!isPrintSack) {
        this.log('', `❗️${this.name}, 错误!`, err)
      } else {
        this.log('', `❗️${this.name}, 错误!`, err.stack)
      }
    }

    wait(time) {
      return new Promise((resolve) => setTimeout(resolve, time))
    }

    done(val = {}) {
      const endTime = new Date().getTime()
      const costTime = (endTime - this.startTime) / 1000
      this.log('', `🔔${this.name}, 结束! 🕛 ${costTime} 秒`)
      this.log()
      if (this.isSurge() || this.isQuanX() || this.isLoon()) {
        $done(val)
      }
    }
  })(name, opts)
}

