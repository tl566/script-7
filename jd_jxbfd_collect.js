/*
新版京喜财富岛 挂机收集海滩贝壳、热气球接待游客
更新日期：2021-07-20
 */
const $ = new Env("京喜财富岛-挂机收集贝壳和热气球");
const JD_API_HOST = "https://m.jingxi.com";
const notify = $.isNode() ? require('./sendNotify') : {};
const jdCookieNode = $.isNode() ? require("./jdCookie.js") : {};
let cookiesArr = [], cookie = '', token = '';
$.appId = 10032;
let JX_UA = `jdpingou;iPhone;4.9.4;14.6;${randPhoneId()};network/wifi;model/iPhone9,2;appBuild/100579;ADID/00000000-0000-0000-0000-000000000000;supportApplePay/1;hasUPPay/0;pushNoticeIsOpen/1;hasOCPay/0;supportBestPay/0;session/936;pap/JA2019_3111800;brand/apple;supportJDSHWK/1;Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E200`;
JX_UA =  $.isNode() ? (process.env.JX_USER_AGENT ? process.env.JX_USER_AGENT : JX_UA) : JX_UA;
$.inviteCodeList = [];
if ($.isNode()) {
  Object.keys(jdCookieNode).forEach((item) => {
    cookiesArr.push(jdCookieNode[item])
  })
  if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => {};
  if (JSON.stringify(process.env).indexOf('GITHUB') > -1) process.exit(0);
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
  $.CryptoJS = $.isNode() ? require('crypto-js') : CryptoJS;
  await requestAlgo();
  if (cookiesArr && cookiesArr.length && $.isNode()) {
    console.log(`\n热气球接待游客 挂机开始，自动8s接待一个游客\n`);
    //兼容iOS
    setInterval(async () => {
      const promiseArr = cookiesArr.map((ck, index) => SpeedUp(ck, index));
      await Promise.all(promiseArr);
      console.count('\n热气球 挂机次数')
    }, 8 * 1000);
  }
  let count = 0;
  while (true) {
    count++
    console.log(`==========================开始第 ${count} 次挂机=======================`)
    for (let i = 0; i < cookiesArr.length; i++) {
      cookie = cookiesArr[i];
      $.UserName = decodeURIComponent(cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1]);
      $.index = i + 1;
      $.nickName = '';
      $.isLogin = true;
      $.nickName = '';
      // await TotalBean();
      console.log(`\n*************开始【京东账号${$.index}】${$.nickName || $.UserName}***************\n`);
      if (!$.isLogin) {
        $.msg($.name, `【提示】cookie已失效`, `京东账号${$.index} ${$.nickName || $.UserName}\n请重新登录获取\nhttps://bean.m.jd.com/bean/signIndex.action`, {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});
        continue
      }
      await main();
    }
    console.log(`第 ${count} 次挂机结束，等待${Math.ceil(20 / cookiesArr.length)}秒，开始第 ${count + 1} 次挂机\n`);
    await $.wait(Math.ceil(20 / cookiesArr.length) * 1000);
  }
})().catch((e) => {$.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')}).finally(() => {$.done();});
async function main() {
  try {
    $.accountFlag = true;
    await QueryUserInfo();
    //账号火爆或者未开启财富岛活动，退出
    if (!$.accountFlag) return
    await $.wait(1000);
    await Promise.all([
      pickShells(),//海滩捡贝壳海螺等
    ]);
  } catch (e) {
    $.logErr(e)
  }
}
//获取信息
function QueryUserInfo() {
  return new Promise(async (resolve) => {
    const body = `ddwTaskId=&strShareId=&strMarkList=guider_step,collect_coin_auth,guider_medal,guider_over_flag,build_food_full,build_sea_full,build_shop_full,build_fun_full,medal_guider_show,guide_guider_show,guide_receive_vistor`;
    const options = taskUrl('user/QueryUserInfo', body, '_cfd_t,bizCode,ddwTaskId,dwEnv,ptag,source,strMarkList,strShareId,strZone');
    $.get(options, async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} activeScene API请求失败，请检查网路重试`)
        } else {
          data = $.toObj(data);
          if (data) {
            if (data['iRet'] === 0) {
              console.log(`获取用户信息: 成功`);
              console.log(`当前财富值：${data['ddwRichBalance']}`)
              console.log(`当前京币：${(data['ddwCoinBalance'] / 10000).toFixed(1)}万`)
            } else {
              console.log(`获取用户信息失败: ${data['sErrMsg']}, iRet: ${data['iRet']}`)
              if (data['iRet'] === 1006) {
                $.accountFlag = false;
              }
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve()
      }
    })
  });
}
//沙滩上捡贝壳
async function pickShells() {
  const queryShell = await pickshell();
  if (queryShell) {
    if (queryShell['iRet'] === 0) {
      let { NormShell } = queryShell['Data'];
      NormShell = NormShell.filter(vo => vo['dwNum'] > 0);
      if (NormShell && NormShell.length === 0) {
        console.log(`账号 ${$.nickName} 当前 海滩 暂无贝壳`);
        return
      }
      for (let item of NormShell) {
        if (item['dwNum'] && item['dwNum'] > 0) {
          for (let i = 0; i < new Array(item['dwNum']).fill('').length; i++) {
            await pickshell(`dwType=${item['dwType']}`, item['dwType']);//珍珠
            await $.wait(1000);
          }
        }
      }
    } else {
      console.log(`查询沙滩信息 失败: ${queryShell['sErrMsg']}, iRet: ${queryShell['iRet']}`)
    }
  }
}
//沙滩捡东西api
function pickshell(body = '', type = 1) {
  return new Promise(async (resolve) => {
    const strType = type === 1 ? '珍珠' : type === 2 ? '小海螺' : type === 3 ? '大海螺' : type === 4 ? '海星' : ''
    let options = taskUrl(`story/pickshell`, body, '_cfd_t,bizCode,dwEnv,dwType,ptag,source,strZone');
    if (!body) {
      options = taskUrl(`story/queryshell`, body, '_cfd_t,bizCode,dwEnv,ptag,source,strZone');
    }
    $.get(options, async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} activeScene API请求失败，请检查网路重试`)
        } else {
          data = $.toObj(data);
          if (data) {
            if (data['iRet'] === 0) {
              if (body) {
                console.log(`账号 ${$.index} ${$.nickName} 沙滩成功捡到一个 ${strType}，${data.Data.strFirstDesc}`);
              }
            } else {
              console.log(`账号 ${$.index} ${$.nickName} 沙滩捡${strType} 失败: ${data['sErrMsg']}, iRet: ${data['iRet']}`)
              if (data['iRet'] === 5403) {
                //东西过多，背包已放不下
                await sell(1, type);
                await $.wait(1000);
                await pickshell(body, type);
              }
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data)
      }
    })
  });
}
async function sell(dwSceneId = 1, type = 0) {
  return new Promise(async (resolve) => {
    const strType = type === 1 ? '珍珠' : type === 2 ? '小海螺' : type === 3 ? '大海螺' : type === 4 ? '海星' : '全部贝壳'
    const options = taskUrl('story/querystorageroom', ``, '_cfd_t,bizCode,dwEnv,ptag,source,strZone');
    $.get(options, async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} activeScene API请求失败，请检查网路重试`)
        } else {
          data = $.toObj(data);
          if (data) {
            if (data['iRet'] === 0) {
              console.log(`获取背包信息: 成功`);
              if (data.Data && data.Data.hasOwnProperty('Office')) {
                const { Office } = data.Data;
                if (Office && Office.length) {
                  let strTypeCnt = '', dwCount = 0, body = '';
                  //出售单个贝壳
                  const s = Office.filter(vo => vo['dwType'] === type);
                  if (s && s.length) {
                    const count = dwCount = randomNum(20, 40);//不卖掉全部贝壳，随机卖掉一些。
                    strTypeCnt = `${s[0]['dwType']}:${count}`;
                    body = `strTypeCnt=${encodeURIComponent(strTypeCnt)}&dwSceneId=${dwSceneId}`;
                    if (body) {
                      console.log(`准备出售 ${strType}，共计：${dwCount}个`);
                      await sellgoods(body, type);
                    }
                  }
                }
              }
            } else {
              console.log(`获取背包信息 失败: ${data['sErrMsg']}, iRet: ${data['iRet']}`);
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve()
      }
    })
  });
}
function sellgoods(body, type) {
  return new Promise(async (resolve) => {
    const strType = type === 1 ? '珍珠' : type === 2 ? '小海螺' : type === 3 ? '大海螺' : type === 4 ? '海星' : '全部贝壳'
    const options = taskUrl('story/sellgoods', body, '_cfd_t,bizCode,dwEnv,dwSceneId,ptag,source,strTypeCnt,strZone');
    $.get(options, async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} activeScene API请求失败，请检查网路重试`)
        } else {
          data = $.toObj(data);
          if (data) {
            if (data['iRet'] === 0) {
              const { Data } = data;
              console.log(`出售 ${strType} 成功，获得京币${Data['ddwCoin']}个，财富值${Data['ddwMoney'] || 0}。`);
            } else {
              console.log(`出售 ${strType} 失败: ${data['sErrMsg']}, iRet: ${data['iRet']}`);
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve()
      }
    })
  });
}
//热气球接待游客
function SpeedUp(ck, index) {
  return new Promise(async (resolve) => {
    const options = taskUrl('user/SpeedUp', 'strBuildIndex=fun', '_cfd_t,bizCode,dwEnv,ptag,source,strBuildIndex,strZone', ck);
    $.get(options, async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} activeScene API请求失败，请检查网路重试`)
        } else {
          data = $.toObj(data);
          if (data) {
            const userName = decodeURIComponent(ck.match(/pt_pin=([^; ]+)(?=;?)/) && ck.match(/pt_pin=([^; ]+)(?=;?)/)[1]);
            if (data['iRet'] === 0) {
              console.log(`账号 ${index + 1} ${userName}【${data['strBuildIndex']}】建筑 成功接待一个游客 ${data['dwIsOverburst'] === 1 ? '暴击' : ''}，＋京币：${data['ddwSpeedCoin']}，今日已接待游客: ${data['dwTodaySpeedPeople'] || 0}`);
            } else {
              console.log(`账号 ${index + 1} ${userName} 接待游客失败: ${data['sErrMsg']}, iRet: ${data['iRet']}\n`)
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve()
      }
    })
  });
}
function taskUrl(function_path, body = '', stk = '', taskCookie = cookie) {
  let url = `${JD_API_HOST}/jxbfd/${function_path}?strZone=jxbfd&bizCode=jxbfd&source=jxbfd&dwEnv=7&_cfd_t=${Date.now()}&ptag=&${body}&_stk=${encodeURIComponent(stk)}&_ste=1`;
  if (['Award'].includes(function_path)) {
    //bizCode=jxbfddch 不同
    url = `${JD_API_HOST}/newtasksys/newtasksys_front/${function_path}?strZone=jxbfd&bizCode=jxbfddch&source=jxbfd&dwEnv=7&_cfd_t=${Date.now()}&ptag=&${body}&_stk=${encodeURIComponent(stk)}&_ste=1`;
  }
  url += `&h5st=${decrypt(Date.now(), stk, '', url)}&_=${Date.now() + 2}&sceneval=2&g_login_type=1&g_ty=ls`;
  return {
    url,
    headers: {
      "Cookie": taskCookie,
      "Accept": "*/*",
      "Connection": "keep-alive",
      "Referer": "https://st.jingxi.com/fortune_island/index.html?ptag=138631.26.55",
      "Accept-Encoding": "gzip, deflate, br",
      "Host": "m.jingxi.com",
      "User-Agent": JX_UA,
      "Accept-Language": "zh-cn",
    },
    timeout: 10000
  };
}
function TotalBean() {
  return new Promise(async resolve => {
    const options = {
      url: "https://me-api.jd.com/user_new/info/GetJDUserInfoUnion",
      headers: {
        Host: "me-api.jd.com",
        Accept: "*/*",
        Connection: "keep-alive",
        Cookie: cookie,
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

/*
修改时间戳转换函数，京喜工厂原版修改
 */
Date.prototype.Format = function (fmt) {
  var e,
      n = this, d = fmt, l = {
        "M+": n.getMonth() + 1,
        "d+": n.getDate(),
        "D+": n.getDate(),
        "h+": n.getHours(),
        "H+": n.getHours(),
        "m+": n.getMinutes(),
        "s+": n.getSeconds(),
        "w+": n.getDay(),
        "q+": Math.floor((n.getMonth() + 3) / 3),
        "S+": n.getMilliseconds()
      };
  /(y+)/i.test(d) && (d = d.replace(RegExp.$1, "".concat(n.getFullYear()).substr(4 - RegExp.$1.length)));
  for (var k in l) {
    if (new RegExp("(".concat(k, ")")).test(d)) {
      var t, a = "S+" === k ? "000" : "00";
      d = d.replace(RegExp.$1, 1 == RegExp.$1.length ? l[k] : ("".concat(a) + l[k]).substr("".concat(l[k]).length))
    }
  }
  return d;
}

async function requestAlgo() {
  new Promise(async resolve => {
    $.fingerprint = await generateFp();
    const options = {
      "url": `https://cactus.jd.com/request_algo?g_ty=ajax`,
      "headers": {
        'Authority': 'cactus.jd.com',
        'Pragma': 'no-cache',
        'Cache-Control': 'no-cache',
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1',
        'Content-Type': 'application/json',
        'Origin': 'https://st.jingxi.com',
        'Sec-Fetch-Site': 'cross-site',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Dest': 'empty',
        'Referer': 'https://st.jingxi.com/',
        'Accept-Language': 'zh-CN,zh;q=0.9,zh-TW;q=0.8,en;q=0.7'
      },
      'body': JSON.stringify({
        "version": "1.0",
        "fp": $.fingerprint,
        "appId": $.appId.toString(),
        "timestamp": Date.now(),
        "platform": "web",
        "expandParams": ""
      })
    }
    $.post(options, (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`request_algo 签名参数API请求失败，请检查网路重试`)
        } else {
          if (data) {
            // console.log(data);
            data = JSON.parse(data);
            if (data['status'] === 200) {
              $.token = data.data.result.tk;
              let enCryptMethodJDString = data.data.result.algo;
              if (enCryptMethodJDString) $.enCryptMethodJD = new Function(`return ${enCryptMethodJDString}`)();
              console.log(`获取签名参数成功！`)
              console.log(`fp: ${$.fingerprint}`)
              console.log(`token: ${$.token}`)
              console.log(`enCryptMethodJD: ${enCryptMethodJDString}`)
            } else {
              console.log(`fp: ${$.fingerprint}`)
              console.log('request_algo 签名参数API请求失败:')
            }
          } else {
            console.log(`京东服务器返回空数据`)
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
}
function decrypt(time, stk, type, url) {
  stk = stk || (url ? getUrlData(url, '_stk') : '')
  if (stk) {
    const timestamp = new Date(time).Format("yyyyMMddhhmmssSSS");
    let hash1 = '';
    if ($.fingerprint && $.token && $.enCryptMethodJD) {
      hash1 = $.enCryptMethodJD($.token, $.fingerprint.toString(), timestamp.toString(), $.appId.toString(), $.CryptoJS).toString($.CryptoJS.enc.Hex);
    } else {
      const random = '5gkjB6SpmC9s';
      $.token = `tk01wcdf61cb3a8nYUtHcmhSUFFCfddDPRvKvYaMjHkxo6Aj7dhzO+GXGFa9nPXfcgT+mULoF1b1YIS1ghvSlbwhE0Xc`;
      $.fingerprint = 5287160221454703;
      const str = `${$.token}${$.fingerprint}${timestamp}${$.appId}${random}`;
      hash1 = $.CryptoJS.SHA512(str, $.token).toString($.CryptoJS.enc.Hex);
    }
    let st = '';
    stk.split(',').map((item, index) => {
      st += `${item}:${getUrlData(url, item)}${index === stk.split(',').length -1 ? '' : '&'}`;
    })
    const hash2 = $.CryptoJS.HmacSHA256(st, hash1.toString()).toString($.CryptoJS.enc.Hex);
    // console.log(`\nst:${st}`)
    // console.log(`h5st:${["".concat(timestamp.toString()), "".concat(fingerprint.toString()), "".concat($.appId.toString()), "".concat(token), "".concat(hash2)].join(";")}\n`)
    return encodeURIComponent(["".concat(timestamp.toString()), "".concat($.fingerprint.toString()), "".concat($.appId.toString()), "".concat($.token), "".concat(hash2)].join(";"))
  } else {
    return '20210318144213808;8277529360925161;10032;tk01w952a1b73a8nU0luMGtBanZTHCgj0KFVwDa4n5pJ95T/5bxO/m54p4MtgVEwKNev1u/BUjrpWAUMZPW0Kz2RWP8v;86054c036fe3bf0991bd9a9da1a8d44dd130c6508602215e50bb1e385326779d'
  }
}

/**
 * 获取url参数值
 * @param url
 * @param name
 * @returns {string}
 */
function getUrlData(url, name) {
  if (typeof URL !== "undefined") {
    let urls = new URL(url);
    let data = urls.searchParams.get(name);
    return data ? data : '';
  } else {
    const query = url.match(/\?.*/)[0].substring(1)
    const vars = query.split('&')
    for (let i = 0; i < vars.length; i++) {
      const pair = vars[i].split('=')
      if (pair[0] === name) {
        // return pair[1];
        return vars[i].substr(vars[i].indexOf('=') + 1);
      }
    }
    return ''
  }
}
/**
 * 模拟生成 fingerprint
 * @returns {string}
 */
function generateFp() {
  let e = "0123456789";
  let a = 13;
  let i = '';
  for (; a--; )
    i += e[Math.random() * e.length | 0];
  return (i + Date.now()).slice(0,16)
}
/**
 * 生成随机 iPhoneID
 * @returns {string}
 */
function randPhoneId() {
  return Math.random().toString(36).slice(2, 10) +
      Math.random().toString(36).slice(2, 10) +
      Math.random().toString(36).slice(2, 10) +
      Math.random().toString(36).slice(2, 10) +
      Math.random().toString(36).slice(2, 10);
}

function randomNum(minNum, maxNum) {
  switch (arguments.length) {
    case 1:
      return parseInt(Math.random() * minNum + 1, 10);
      break;
    case 2:
      return parseInt(Math.random() * (maxNum - minNum + 1) + minNum, 10);
      break;
    default:
      return 0;
      break;
  }
}
// prettier-ignore
function Env(t,e){"undefined"!=typeof process&&JSON.stringify(process.env).indexOf("GITHUB")>-1&&process.exit(0);class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}