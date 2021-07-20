/*
新版京喜财富岛，已完成
更新日期：2021-07-20
 */
const $ = new Env("京喜财富岛");
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
  for (let i = 0; i < cookiesArr.length; i++) {
    cookie = cookiesArr[i];
    $.UserName = decodeURIComponent(cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1]);
    $.index = i + 1;
    $.nickName = '';
    $.isLogin = true;
    $.nickName = '';
    await TotalBean();
    console.log(`\n*************开始【京东账号${$.index}】${$.nickName || $.UserName}***************\n`);
    if (!$.isLogin) {
      $.msg($.name, `【提示】cookie已失效`, `京东账号${$.index} ${$.nickName || $.UserName}\n请重新登录获取\nhttps://bean.m.jd.com/bean/signIndex.action`, {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});
      if ($.isNode()) {
        await notify.sendNotify(`${$.name}cookie已失效 - ${$.UserName}`, `京东账号${$.index} ${$.UserName}\n请重新登录获取cookie`);
      }
      continue
    }
    await main();
  }
  for (let i = 0; i < cookiesArr.length; i++) {
    cookie = cookiesArr[i];
    $.UserName = decodeURIComponent(cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1]);
    $.index = i + 1;
    $.nickName = '';
    try {
      for (let index = 0; index < $.inviteCodeList.length; index ++) {
        $.userInviteInfo = $.inviteCodeList[index];
        if ($.userInviteInfo['user'] === $.UserName) continue;
        if ($.userInviteInfo['max']) continue;
        if (!$.userInviteInfo['canReceiveHelp']) continue;
        console.log(`\n京东账号 ${$.index} ${$.UserName} 开始助力好友 ${$.userInviteInfo['user']}，邀请码为：${$.userInviteInfo['code']}`);
        const data = await helpbystage($.userInviteInfo['code']);
        if (data) {
          if (data['iRet'] === 0) {
            console.log(`助力 成功，获得${data['Data']['GuestPrizeInfo']['strPrizeName']}`);
          } else {
            console.log(`助力 失败: ${data['sErrMsg']}, iRet: ${data['iRet']}`);
            //助力机会耗尽：2235，
            //2229：助力人账号火爆，2230：接收助力的人账号火爆
            if (data['iRet'] === 2235 || data['iRet'] === 2229) break;
            //好友已不需要助力
            if (data['iRet'] === 2190) $.inviteCodeList[index]['max'] = true;
            //接收助力者账号火爆
            if (data['iRet'] === 2230) $.inviteCodeList[index]['canReceiveHelp'] = false;
          }
        }
        await $.wait(2000);
      }
    } catch (e) {
      $.logErr(e)
    }
  }
})().catch((e) => {$.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')}).finally(() => {$.done();});
async function main() {
  try {
    $.accountFlag = true;
    await QueryUserInfo();
    //账号火爆，退出
    if (!$.accountFlag) return
    await QueryMedalList();//使用勋章
    await Rubbishs();//垃圾功能
    await storyOper();//特殊岛民朋友
    await doComposeGame();//去玩合成金珍珠游戏
    await pickShells();//海滩捡贝壳海螺等
    await doTasks();//任务赚京币&成就赚财富
    await rewardSign();//连续营业赢红包&打工赢红包
    await buildAction();//建筑升级与收集金币
    await EmployTourGuideFun();//雇佣导游
    await SpeedUp();//接待游客
    await GetActTask();//活动任务
    await receiveBigReward();//完成所有任务开宝箱
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
              console.log(`当前等级：${data['dwLandLvl']}岛主`)
              console.log(`当前财富值：${data['ddwRichBalance']}`)
              console.log(`当前京币：${(data['ddwCoinBalance'] / 10000).toFixed(1)}万`)
              console.log(`已接待游客: ${data['buildInfo']['dwTodaySpeedPeople']}\n`);

              if (data['strMyShareId']) {
                console.log(`\n【京东账号${$.index}（${$.UserName}）的${$.name}好友互助码】${data['strMyShareId']}\n\n`);
                $.inviteCodeList.push({
                  'user': $.UserName,
                  'code': data['strMyShareId'],
                  'max': false,
                  'canReceiveHelp': true
                });
              }
              $.buildInfo = data['buildInfo'];
              $.StoryInfo = data['StoryInfo'];
              //if (data['dwOfficeUnLock'] === 0) {
                //console.log(`\n当前账号未开启 财富岛活动\n`);
                //$.accountFlag = false;
              //}
              // if (data['buildInfo']['dwTodaySpeedPeople'] >= 20) $.SpeedUp = true;
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
//热气球接待游客
function SpeedUp() {
  return new Promise(async (resolve) => {
    const options = taskUrl('user/SpeedUp', 'strBuildIndex=fun', '_cfd_t,bizCode,dwEnv,ptag,source,strBuildIndex,strZone');
    $.get(options, async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} activeScene API请求失败，请检查网路重试`)
        } else {
          data = $.toObj(data);
          if (data) {
            if (data['iRet'] === 0) {
              console.log(`\n【${data['strBuildIndex']}】建筑 成功接待一个游客 ${data['dwIsOverburst'] === 1 ? '暴击' : ''}，＋京币：${data['ddwSpeedCoin']}，今日已接待游客: ${data['dwTodaySpeedPeople'] || 0}`);
              if (data['dwTodaySpeedPeople']) {
                console.log(`今日已接待游客: ${data['dwTodaySpeedPeople']}\n`);
                if (data['dwTodaySpeedPeople'] < 20) {
                  await $.wait(2000);
                  await SpeedUp();
                }
              }
            } else {
              console.log(`接待游客失败: ${data['sErrMsg']}, iRet: ${data['iRet']}`)
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
function receiveBigReward() {
  return new Promise(async (resolve) => {
    const options = taskUrl('story/GetActTask', '', '_cfd_t,bizCode,dwEnv,ptag,source,strZone');
    $.get(options, async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} activeScene API请求失败，请检查网路重试`)
        } else {
          data = $.toObj(data);
          if (data) {
            if (data['iRet'] === 0) {
              if (data['Data']['dwTotalTaskNum'] !== data['Data']['dwCompleteTaskNum'] && data['Data']['dwStatus'] === 1) {
                console.log(`当前所有任务暂未完成，暂不能开宝箱\n`);
              }
              if (data['Data']['dwTotalTaskNum'] === data['Data']['dwCompleteTaskNum'] && data['Data']['dwStatus'] === 3) {
                //完成所有任务开宝箱
                console.log(`${data['Data']['strContent']}，开始领奖`);
                await ActTaskAward();
              } else if (data['Data']['dwTotalTaskNum'] === data['Data']['dwCompleteTaskNum'] && data['Data']['dwStatus'] === 4) {
                console.log(`【完成所有任务开宝箱】 奖励已领取`);
              }
            } else {
              console.log(`GetActTask 获取任务列表失败: ${data['sErrMsg']}, iRet: ${data['iRet']}`)
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
function GetActTask() {
  return new Promise(async (resolve) => {
    const options = taskUrl('story/GetActTask', '', '_cfd_t,bizCode,dwEnv,ptag,source,strZone');
    $.get(options, async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} activeScene API请求失败，请检查网路重试`)
        } else {
          data = $.toObj(data);
          if (data) {
            if (data['iRet'] === 0) {
              const tasks = data.Data.TaskList || [];
              for (let task of tasks) {
                console.log(`【${task.strTaskName}】任务进度：${task.dwCompleteNum}/${task.dwTargetNum}`);
                if ((task.dwCompleteNum === task.dwTargetNum) && task.dwAwardStatus === 2) {
                  console.log(`开始领取 【${task.strTaskName}】任务奖励`)
                  await Award(task['ddwTaskId'])
                  await $.wait(1000);
                }
              }
            } else {
              console.log(`GetActTask 获取任务列表失败: ${data['sErrMsg']}, iRet: ${data['iRet']}`)
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
function doComposeGame() {
  return new Promise(async (resolve) => {
    const options = {
      url: `https://m.jingxi.com/jxbfd/user/ComposeGameState?__t=${Date.now()}&strZone=jxbfd&dwFirst=1&_=${Date.now() + 5}&sceneval=2&g_login_type=1&g_ty=ls`,
      timeout: 10000,
      headers: {
        "Cookie": cookie,
        "Accept": "*/*",
        "Connection": "keep-alive",
        "Referer": "https://st.jingxi.com/fortune_island/index.html?ptag=138631.26.55",
        "Accept-Encoding": "gzip, deflate, br",
        "Host": "m.jingxi.com",
        "User-Agent": JX_UA,
        "Accept-Language": "zh-cn",
      }
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
              let maxCount = 0, temp = [];
              const { stagelist = [], dwCurProgress = 0, strMyShareId, strDT } = data;
              $.gameAddTimes = dwCurProgress;//记录已完成游戏次数
              if (stagelist.length) stagelist.map(vo => temp.push(vo['dwCurStageEndCnt']));
              maxCount = Math.max(...temp);
              console.log(`\n获取 合成珍珠游戏详情 成功，游戏进度：${dwCurProgress}/${maxCount}`);
              if (dwCurProgress < maxCount) {
                for (let i = dwCurProgress; i < maxCount; i++) {
                  const time = randomNum(30000, 50000);
                  const ss = Math.floor(time / 1000)
                  console.log(`开始第 ${i + 1} 次合成珍珠游戏，为防止黑号模拟真实情况 需等待${ss}秒，在此期间请勿手动进入合成珍珠游戏页面`);
                  for (let k = 0; k < ss; k+=5) {
                    await $.wait(5000);
                    await RealTmReport(strMyShareId);
                  }
                  await $.wait(1000);
                  await ComposeGameAddProcess(`strBT=${strDT}`);
                }
                for (let j = 0; j < stagelist.length; j++) {
                  $.oneStage = stagelist[j];
                  if ($.oneStage.dwIsAward === 1) {
                    console.log(`第${j + 1}颗珍珠奖励：${$.oneStage.ddwCoin}京币，${$.oneStage.ddwMoney}财富值，已领取`);
                  } else if ($.oneStage.dwIsAward === 0 && $.gameAddTimes >= $.oneStage.dwCurStageEndCnt) {
                    console.log(`第${j + 1}颗珍珠奖励：可获得：${$.oneStage.ddwCoin}京币，${$.oneStage.ddwMoney}财富值，现在开始领取`);
                    await ComposeGameAward(`dwCurStageEndCnt=${$.oneStage['dwCurStageEndCnt']}`);
                    await $.wait(1000);
                  } else {
                    console.log(`第${j + 1}颗珍珠奖励：${$.oneStage.ddwCoin}京币，${$.oneStage.ddwMoney}财富值，不可领取`);
                  }
                }
              } else {
                console.log(`合成珍珠游戏 已完成`);
                for (let j = 0; j < stagelist.length; j++) {
                  $.oneStage = stagelist[j];
                  if ($.oneStage.dwIsAward === 1) {
                    console.log(`第${j + 1}颗珍珠奖励：${$.oneStage.ddwCoin}京币，${$.oneStage.ddwMoney}财富值，已领取`);
                  } else if ($.oneStage.dwIsAward === 0 && $.gameAddTimes >= $.oneStage.dwCurStageEndCnt) {
                    console.log(`第${j + 1}颗珍珠奖励：可获得：${$.oneStage.ddwCoin}京币，${$.oneStage.ddwMoney}财富值，现在开始领取`);
                    await ComposeGameAward(`dwCurStageEndCnt=${$.oneStage['dwCurStageEndCnt']}`);
                    await $.wait(1000);
                  } else {
                    console.log(`第${j + 1}颗珍珠奖励：${$.oneStage.ddwCoin}京币，${$.oneStage.ddwMoney}财富值，不可领取`);
                  }
                }
              }
            } else {
              console.log(`获取 合成珍珠游戏详情 失败: ${data['sErrMsg']}, iRet: ${data['iRet']}`)
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
//模拟在玩游戏
function RealTmReport(strMyShareId) {
  return new Promise(async (resolve) => {
    let options = {
      url: `${JD_API_HOST}/jxbfd/user/RealTmReport?__t=${Date.now()}&dwIdentityType=0&strBussKey=composegame&strMyShareId=${strMyShareId}&ddwCount=5&_=${Date.now() + 2}&sceneval=2&g_login_type=1&g_ty=ls`,
      headers: {
        "Cookie": cookie,
        "Accept": "*/*",
        "Connection": "keep-alive",
        "Referer": "https://st.jingxi.com/fortune_island/index.html?ptag=138631.26.55",
        "Accept-Encoding": "gzip, deflate, br",
        "Host": "m.jingxi.com",
        "User-Agent": JX_UA,
        "Accept-Language": "zh-cn",
      },
      timeout: 10000
    }
    $.get(options, (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} activeScene API请求失败，请检查网路重试`)
        } else {
          data = $.toObj(data);
          if (data) {
            if (data['iRet'] === 0) {
              console.log(`RealTmReport 成功 ${(new Date()).Format("yyyy-MM-dd hh:mm:ss | S")}`)
            } else {
              console.log(`RealTmReport失败: ${data['sErrMsg']}, iRet: ${data['iRet']}`)
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
//记录游戏成功
function ComposeGameAddProcess(body = '') {
  return new Promise(async (resolve) => {
    const options = taskUrl('user/ComposeGameAddProcess', body, '__t,strBT,strZone');
    $.get(options, async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} activeScene API请求失败，请检查网路重试`)
        } else {
          data = $.toObj(data);
          if (data) {
            if (data['iRet'] === 0) {
              console.log(`合成珍珠 成功，获得：${data['dwCurProgress']}颗珍珠\n`);
              $.gameAddTimes ++;
            } else {
              console.log(`合成珍珠 失败: ${data['sErrMsg']}, iRet: ${data['iRet']}`)
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
//领取珍珠游戏奖励
function ComposeGameAward(body) {
  return new Promise(async (resolve) => {
    const options = taskUrl('user/ComposeGameAward', body, '__t,dwCurStageEndCnt,strZone');
    $.get(options, async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} activeScene API请求失败，请检查网路重试`)
        } else {
          data = $.toObj(data);
          if (data) {
            if (data['iRet'] === 0) {
              console.log(`珍珠奖励领取 成功，获得：${data['ddwCoin']}京币，${data['ddwMoney']}财富值\n`);
            } else {
              console.log(`珍珠奖励领取 失败: ${data['sErrMsg']}, iRet: ${data['iRet']}`)
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
function Award(taskId, type) {
  return new Promise(async (resolve) => {
    let options = taskUrl('Award', `taskId=${taskId}`, '_cfd_t,bizCode,dwEnv,ptag,source,strZone,taskId');
    if (type) {
      options = taskListUrl('Award', `taskId=${taskId}`, '_cfd_t,bizCode,dwEnv,ptag,source,strZone,taskId');
    }
    $.get(options, (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} activeScene API请求失败，请检查网路重试`)
        } else {
          // console.log('领取奖励', data);
          data = $.toObj(data);
          if (data) {
            if (data['ret'] === 0) {
              if (data.data.prizeInfo) {
                const prizeInfo = $.toObj(data.data.prizeInfo);
                if (prizeInfo['errmsg'] === 'success') {
                  if (prizeInfo['ddwCoin']) console.log(`领取任务奖励成功，获得：${prizeInfo['ddwCoin']}京币\n`);
                }
              }
            } else {
              console.log(`领取任务奖励失败: ${data['msg']}, iRet: ${data['ret']}`)
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
function ActTaskAward() {
  return new Promise(async (resolve) => {
    const options = taskUrl('story/ActTaskAward', '', '_cfd_t,bizCode,dwEnv,ptag,source,strZone');
    $.get(options, async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} activeScene API请求失败，请检查网路重试`)
        } else {
          data = $.toObj(data);
          if (data) {
            if (data['iRet'] === 0) {
              console.log(`完成所有任务开宝箱 成功，获得：${data['Data']['ddwBigReward']}财富值\n`);
            } else {
              console.log(`完成所有任务开宝箱 失败: ${data['sErrMsg']}, iRet: ${data['iRet']}`)
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
function DoTask(taskId) {
  return new Promise(async (resolve) => {
    let options = taskListUrl('DoTask', `taskId=${taskId}&configExtra=`, '_cfd_t,bizCode,configExtra,dwEnv,ptag,source,strZone,taskId');
    $.get(options, (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} activeScene API请求失败，请检查网路重试`)
        } else {
          // console.log('做任务:', data);
          data = $.toObj(data);
          if (data) {
            if (data['ret'] === 0) {
              if (data['data']['awardStatus'] === 2) console.log(`做任务成功\n`)
            } else {
              console.log(`做任务失败: ${data['msg']}, iRet: ${data['ret']}\n`)
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
async function storyOper() {
  if ($.StoryInfo && $.StoryInfo.hasOwnProperty('StoryList')) {
    const { StoryList } = $.StoryInfo;
    for (let story of StoryList) {
      const { strStoryId, dwType, dwStatus, ddwTriggerDay } = story;
      console.log(`story：dwStatus：${story['dwStatus']}，dwType：${story['dwType']}\n`)
      if (strStoryId && ddwTriggerDay) {
        if (dwStatus === 1) {
          if (dwType === 4) {
            //卖贝壳给收藏家
            console.log(`海滩： 卖贝壳给收藏家`)
            console.log(`${story['Collector']['strRecvDesc']}\n`);
            let body = `strStoryId=${strStoryId}&dwType=2&ddwTriggerDay=${ddwTriggerDay}`;
            await CollectorOper('CollectorOper', body, '_cfd_t,bizCode,ddwTriggerDay,dwEnv,dwType,ptag,source,strStoryId,strZone');
            //尝试第一次收集贝壳
            await pickShells();
            await $.wait(10 * 1000);
            //尝试第二次收集贝壳
            await pickShells();
            await sell(2);//卖给收藏家：dwSceneId = 2，自己主动售卖：dwSceneId = 1
            await $.wait(1000);
            body = `strStoryId=${strStoryId}&dwType=4&ddwTriggerDay=${ddwTriggerDay}`;
            await CollectorOper('CollectorOper', body, '_cfd_t,bizCode,ddwTriggerDay,dwEnv,dwType,ptag,source,strStoryId,strZone');
          } else if (dwType === 1) {
            //美食家上岛或小情侣或失眠人
            console.log(`海滩： 美食家上岛或小情侣或失眠人`)
            console.log(`${story['Special']['strTalk']}\n`);
            let body = `strStoryId=${strStoryId}&dwType=2&ddwTriggerDay=${ddwTriggerDay}&triggerType=${story['Special']['dwTriggerType']}`;
            await CollectorOper('SpecialUserOper', body, `_cfd_t,bizCode,ddwTriggerDay,dwEnv,dwType,ptag,source,strStoryId,strZone,triggerType`);
            await $.wait(31 * 1000);
            body = `strStoryId=${strStoryId}&dwType=3&ddwTriggerDay=${ddwTriggerDay}&triggerType=${story['Special']['dwTriggerType']}`;
            await CollectorOper('SpecialUserOper', body, `_cfd_t,bizCode,ddwTriggerDay,dwEnv,dwType,ptag,source,strStoryId,strZone,triggerType`);
          } else if (dwType === 2) {
            //拯救美人鱼
            console.log(`海滩： 拯救美人鱼`)
            console.log(`${story['Mermaid']['strTalk']}\n`);
            let body = `strStoryId=${strStoryId}&dwType=1&ddwTriggerDay=${ddwTriggerDay}`;
            await CollectorOper('MermaidOper', body, `_cfd_t,bizCode,ddwTriggerDay,dwEnv,dwType,ptag,source,strStoryId,strZone`);
            await $.wait(2 * 1000);
            body = `strStoryId=${strStoryId}&dwType=3&ddwTriggerDay=${ddwTriggerDay}`;
            await CollectorOper('MermaidOper', body, `_cfd_t,bizCode,ddwTriggerDay,dwEnv,dwType,ptag,source,strStoryId,strZone`);
            await $.wait(2 * 1000);
            body = `strStoryId=${strStoryId}&dwType=2&ddwTriggerDay=${ddwTriggerDay}`;
            await CollectorOper('MermaidOper', body, `_cfd_t,bizCode,ddwTriggerDay,dwEnv,dwType,ptag,source,strStoryId,strZone`);
          } else {
            console.log(`出现未知【特殊岛民】 dwStatus：${dwStatus}，dwType：${dwType}，${$.toStr(story)}\n`);
            await notify.sendNotify($.name, `账号 ${$.index} ${$.UserName}\\n出现未知【特殊岛民】 dwStatus：${dwStatus}，dwType：${dwType}，${$.toStr(story)}`);
          }
        } else if (dwStatus === 3) {
          if (dwType === 1) {
            //大胃王
            console.log(`海滩： 大胃王`)
            console.log(`${story['Special']['strTalk']}\n`);
            let body = `strStoryId=${strStoryId}&dwType=3&ddwTriggerDay=${ddwTriggerDay}&triggerType=${story['Special']['dwTriggerType']}`;
            await CollectorOper('SpecialUserOper', body, `_cfd_t,bizCode,ddwTriggerDay,dwEnv,dwType,ptag,source,strStoryId,strZone,triggerType`);
          } else {
            console.log(`出现未知【特殊岛民】 dwStatus：${dwStatus}，dwType：${dwType}，${$.toStr(story)}\n`);
            await notify.sendNotify($.name, `账号 ${$.index} ${$.UserName}\\n出现未知【特殊岛民】 dwStatus：${dwStatus}，dwType：${dwType}，${$.toStr(story)}`);
          }
        } else if (dwStatus === 4) {
          if (dwType === 2) {
            //美人鱼感恩回归
            console.log(`海滩： 美人鱼感恩回归`)
            console.log(`${story['Mermaid']['strTalk4']}\n`);
            let body = `strStoryId=${strStoryId}&dwType=4&ddwTriggerDay=${ddwTriggerDay}`;
            await CollectorOper('MermaidOper', body, `_cfd_t,bizCode,ddwTriggerDay,dwEnv,dwType,ptag,source,strStoryId,strZone`);
          } else {
            console.log(`出现未知【特殊岛民】 dwStatus：${dwStatus}，dwType：${dwType}，${$.toStr(story)}\n`);
            await notify.sendNotify($.name, `账号 ${$.index} ${$.UserName}\\n出现未知【特殊岛民】 dwStatus：${dwStatus}，dwType：${dwType}，${$.toStr(story)}`);
          }
        } else {
          console.log(`出现未知【特殊岛民】 dwStatus：${dwStatus}，dwType：${dwType}，${$.toStr(story)}\n`);
          await notify.sendNotify($.name, `账号 ${$.index} ${$.UserName}\\n出现未知【特殊岛民】 dwStatus：${dwStatus}，dwType：${dwType}，${$.toStr(story)}`);
        }
      }
    }
  } else {
    console.log(`当前沙滩暂无 岛民朋友`);
  }
}
//沙滩上捡贝壳
async function pickShells() {
  console.log(`\n`);
  const queryShell = await pickshell();
  if (queryShell) {
    if (queryShell['iRet'] === 0) {
      const { NormShell } = queryShell['Data'];
      for (let item of NormShell) {
        if (item['dwNum'] && item['dwNum'] > 0) {
          for (let i = 0; i < new Array(item['dwNum']).fill('').length; i++) {
            await pickshell(`dwType=${item['dwType']}`, item['dwType']);//珍珠
            await $.wait(2000);
          }
        }
      }
    } else {
      console.log(`查询沙滩信息 失败: ${queryShell['sErrMsg']}, iRet: ${queryShell['iRet']}`)
    }
  }
  console.log(`\n`);
}
function CollectorOper(funtionId, body, stk = '') {
  return new Promise(async (resolve) => {
    const options = taskUrl(`story/${funtionId}`, body, stk);
    $.get(options, async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} activeScene API请求失败，请检查网路重试`)
        } else {
          // console.log(funtionId, data);
          data = $.toObj(data);
          if (data) {
            if (data['iRet'] === 0) {
              console.log(`${funtionId} 成功！${$.toStr(data)}\n`);
            } else {
              console.log(`${funtionId} 失败: ${data['sErrMsg']}, iRet: ${data['iRet']}`)
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
async function QueryMedalList() {
  return new Promise(async (resolve) => {
    const options = taskUrl(`story/QueryMedalList`, ``, `_cfd_t,bizCode,dwEnv,ptag,source,strZone`);
    $.get(options, async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} QueryMedalList API请求失败，请检查网路重试`)
        } else {
          data = $.toObj(data);
          if (data) {
            if (data['iRet'] === 0) {
              const { IslandMedal: { dwBuildTotalLv, dwNeedBuildNum, dwLevel } = {}, MedalList: { Island, ...allMedals } = {} } = data['Data'];
              console.log(`\n当前建筑总等级${dwBuildTotalLv}，再升${dwNeedBuildNum}级可晋升${dwLevel + 1}级岛主\n`);
              const Medals = [...allMedals.Love, ...allMedals.Env, ...allMedals.Shop];
              for (const island of Island) {
                if (island['dwStatus'] === 1) {
                  console.log(`等级勋章【${island['strMedalName']}】进度：${island['dwHasRatio']}%`);
                }
              }
              for (const Medal of Medals) {
                const medalName = Medal['dwType'] === 1 ? '爱心勋章' : Medal['dwType'] === 2 ? '环境勋章' : Medal['dwType'] === 3 ? '经商勋章' : '未知勋章：' + Medal['dwType']
                if (Medal['dwStatus'] === 1) {
                  console.log(`${medalName}【${Medal['strMedalName']}】进度：${Medal['dwHasRatio']}%`);
                }
              }
              for (const Medal of Medals) {
                const medalName = Medal['dwType'] === 1 ? '爱心勋章' : Medal['dwType'] === 2 ? '环境勋章' : Medal['dwType'] === 3 ? '经商勋章' : '未知勋章：' + Medal['dwType']
                if (Medal['dwStatus'] === 2) {
                  console.log(`${medalName}【${Medal['strMedalName']}】进度：${Medal['dwHasRatio']}%，开始使用此勋章`);
                  const body = `dwType=${Medal.dwType}&dwLevel=${Medal.dwLevel}`;
                  const res = await UserMedal(body);
                  if (res && res['iRet'] === 0) {
                    break;//一次只能使用一个勋章
                  }
                }
              }
            } else {
              console.log(`查询勋章 QueryMedalList 失败: ${data['sErrMsg']}, iRet: ${data['iRet']}`)
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
//使用勋章API
function UserMedal(body) {
  return new Promise(async (resolve) => {
    const options = taskUrl(`story/UserMedal`, body, `_cfd_t,bizCode,dwEnv,dwLevel,dwType,ptag,source,strZone`);
    $.get(options, async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} activeScene API请求失败，请检查网路重试`)
        } else {
          // console.log(funtionId, data);
          data = $.toObj(data);
          if (data) {
            if (data['iRet'] === 0) {
              console.log(`使用勋章 成功！${$.toStr(data)}\n`);
            } else {
              console.log(`使用勋章 失败: ${data['sErrMsg']}, iRet: ${data['iRet']}`)
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
                console.log(`沙滩成功捡到一个 ${strType}，${data.Data.strFirstDesc}`);
              }
            } else {
              console.log(`沙滩捡${strType}失败: ${data['sErrMsg']}, iRet: ${data['iRet']}`)
              if (data['iRet'] === 5403) {
                //东西过多，背包已放不下
                await sell(1, type);
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
//处理垃圾功能
async function Rubbishs() {
  return new Promise(async (resolve) => {
    const options = taskUrl(`story/QueryRubbishInfo`, '', `_cfd_t,bizCode,dwEnv,ptag,source,strZone`);
    $.get(options, async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} activeScene API请求失败，请检查网路重试`)
        } else {
          data = $.toObj(data);
          if (data) {
            if (data['iRet'] === 0) {
              const { StoryInfo } = data['Data'];
              if (StoryInfo && StoryInfo['StoryList'] && StoryInfo['StoryList'].length) {
                for (const Story of StoryInfo['StoryList']) {
                  const { Rubbish , strStoryId, dwStatus } = Story;
                  const { RubbishList, TalkList, strBuildType } = Rubbish;
                  console.log(`${TalkList.toString()}`);
                  //接收任务
                  const strBuild = strBuildType === 'food' ? '京喜美食城' : strBuildType === 'sea' ? '京喜旅馆' : strBuildType === 'shop' ? '京喜商店' : strBuildType === 'fun' ? '京喜游乐场' : `未知建筑 ${strBuildType}`;
                  console.log(`开始回收【${strBuild}】建筑的垃圾`)
                  let RubbishOper = await CollectorOper('RubbishOper', 'dwType=1&dwRewardType=0', `_cfd_t,bizCode,dwEnv,dwRewardType,dwType,ptag,source,strZone`);
                  if (RubbishOper) {
                    if (RubbishOper['iRet'] === 0) {
                      if (RubbishOper.Data.hasOwnProperty('ThrowRubbish')) {
                        const { ThrowRubbish } = RubbishOper.Data;
                        if (ThrowRubbish['dwIsNeedDoGame'] === 1) {
                          if (ThrowRubbish['Game'] && ThrowRubbish['Game'].hasOwnProperty('RubbishList')) {
                            const { RubbishList } = ThrowRubbish['Game'];
                            for (const item of RubbishList) {
                              //dwType 0：可回收垃圾，1：有毒垃圾，2：厨房垃圾，3：其他垃圾
                              console.log(`开始垃圾分类回收第${item['dwId']}个垃圾 ${item['strName']}，可获得${item['ddwCoin']}京币`);
                              await CollectorOper('RubbishOper', `dwType=2&dwRewardType=0&dwRubbishId=${item['dwId']}`, `_cfd_t,bizCode,dwEnv,dwRewardType,dwRubbishId,dwType,ptag,source,strZone`);
                              await $.wait(2000);
                            }
                          }
                        } else if (ThrowRubbish['dwIsNeedDoGame'] === 0) {
                          console.log(`回收垃圾成功，获得 ${ThrowRubbish['ddwCoin']} 京币\n`)
                        }
                      }
                    }
                  }
                }
              } else {
                console.log(`\n查询垃圾信息 成功！当前暂无垃圾，下次垃圾出现时间：${$.time('yyyy-MM-dd HH:mm:ss', data['Data']['ddwNextStart'] * 1000)}\n`);
              }
            } else {
              console.log(`查询垃圾信息 失败: ${data['sErrMsg']}, iRet: ${data['iRet']}`)
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
async function doTasks() {
  return new Promise(async (resolve) => {
    const options = taskListUrl('GetUserTaskStatusList', `taskId=0`, '_cfd_t,bizCode,dwEnv,ptag,source,strZone,taskId');
    $.get(options, async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} activeScene API请求失败，请检查网路重试`)
        } else {
          data = $.toObj(data);
          if (data) {
            if (data['ret'] === 0) {
              const tasks = data['data']['userTaskStatusList'] || [];
              let tasks1 = tasks.filter(vo => vo['taskType'] === 11);
              let tasks2 = tasks.filter(task => task['taskType'] === 6 || task['taskType'] === 15 || task['taskType'] === 14);
              for (let task of tasks1) {
                //成就任务
                console.log(`成就赚财富 【${task.taskName}】任务进度：${task.completedTimes}/${task.targetTimes}`);
                if ((task.completedTimes === task.targetTimes) && task.awardStatus === 2) {
                  console.log(`开始领取 【${task.taskName}】任务奖励`)
                  await Award(task['taskId'], 'newtasksys')
                  await $.wait(1000);
                }
              }
              console.log(`\n`);
              for (let task of tasks2) {
                //活动任务
                console.log(`任务赚京币 【${task.taskName}】任务进度：${task.completedTimes}/${task.targetTimes}`);
                if ((task.completedTimes === task.targetTimes) && task.awardStatus === 2) {
                  console.log(`开始领取 【${task.taskName}】任务奖励`)
                  await Award(task['taskId'], 'newtasksys')
                  await $.wait(1000);
                } else if (task.awardStatus === 2 && task.completedTimes < task.targetTimes) {
                  for (let i = 0; i < (task.targetTimes - task.completedTimes); i++) {
                    console.log(`开始做 【${task.taskName}】任务`);
                    await DoTask(task['taskId']);
                    await $.wait(5000);
                  }
                  console.log(`开始领取 【${task.taskName}】任务奖励`)
                  await Award(task['taskId'], 'newtasksys')
                  await $.wait(1000);
                }
              }
            } else {
              console.log(`获取 任务赚京币列表 失败: ${data['msg']}, iRet: ${data['ret']}`)
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
async function rewardSign() {
  await GetTakeAggrPage();
  if ($.TakeAggrPageData && $.TakeAggrPageData.hasOwnProperty('Sign')) {
    const { SignList, dwTodayStatus, dwTodayId } = $.TakeAggrPageData['Sign'];
    if (dwTodayStatus === 1) {
      console.log(`\n【连续营业赢红包】 奖励已领取\n`);
    } else {
      let ddwCoin = 0, ddwMoney = 0, dwPrizeType = 0, dwPrizeLv = 0, strPrizePool = "", strDiscount = '';
      for (let sign of SignList) {
        if (dwTodayId === sign['dwDayId']) {
          ddwCoin = sign['ddwCoin'];
          ddwMoney = sign['ddwMoney'];
          dwPrizeType = sign['dwPrizeType'];
          dwPrizeLv = sign['dwBingoLevel'];
          strDiscount = sign['strDiscount'];
          strPrizePool = sign['strPrizePool'] ? sign['strPrizePool'] : "";
        }
      }
      console.log(`开始做 【连续营业赢红包】任务，可获得京币：${ddwCoin}个，红包：${strDiscount}元`);
      const body = `ddwCoin=${ddwCoin}&ddwMoney=${ddwMoney}&dwPrizeType=${dwPrizeType}&strPrizePool=${strPrizePool}&dwPrizeLv=${dwPrizeLv}`;
      await RewardSign(body);
    }
  }
  //打工赢红包
  if ($.TakeAggrPageData && $.TakeAggrPageData.hasOwnProperty('Employee')) {
    const { EmployeeList, dwNeedTotalPeople } = $.TakeAggrPageData['Employee'];
    console.log(`【打工赢红包】当前已邀请好友 ${EmployeeList.length}/${dwNeedTotalPeople}\n`);
    for (const Employee of EmployeeList) {
      if (Employee['dwStatus'] !== 0) continue;
      if (!Employee['dwId']) continue;
      console.log(`收取第${Employee['dwId']}个助力奖励：${Employee['dwStagePrizeType'] === 4 ? Employee['strPrizeName'] + '红包' : ''}`);
      await helpdraw(Employee['dwId']);
      await $.wait(2000);
    }
  }
}
function GetTakeAggrPage() {
  return new Promise(async (resolve) => {
    const options = taskUrl('story/GetTakeAggrPage', ``, '_cfd_t,bizCode,dwEnv,ptag,source,strZone');
    $.get(options, (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} activeScene API请求失败，请检查网路重试`)
        } else {
          data = $.toObj(data);
          if (data) {
            if (data['iRet'] === 0) {
              $.TakeAggrPageData = data['Data'];
            } else {
              console.log(`GetTakeAggrPage失败: ${data['sErrMsg']}, iRet: ${data['iRet']}\n`)
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
function RewardSign(body) {
  return new Promise(async (resolve) => {
    const options = taskUrl('story/RewardSign', body, '_cfd_t,bizCode,ddwCoin,ddwMoney,dwEnv,dwPrizeLv,dwPrizeType,ptag,source,strPrizePool,strZone');
    $.get(options, (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} activeScene API请求失败，请检查网路重试`)
        } else {
          data = $.toObj(data);
          if (data) {
            if (data['iRet'] === 0) {
              console.log(`连续营业赢红包 奖励领取成功，京币：${data['Data']['ddwCoin']}，红包：${data['Data']['strPrizeName']}\n`);
            } else {
              console.log(`连续营业赢红包 奖励领取失败: ${data['sErrMsg']}, iRet: ${data['iRet']}\n`)
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
function helpdraw(dwUserId) {
  return new Promise(async (resolve) => {
    const options = taskUrl('story/helpdraw', `dwUserId=${dwUserId}`, '_cfd_t,bizCode,dwEnv,dwUserId,ptag,source,strZone');
    $.get(options, (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} activeScene API请求失败，请检查网路重试`)
        } else {
          data = $.toObj(data);
          if (data) {
            if (data['iRet'] === 0) {
              console.log(`打工赢红包`, $.toStr(data));
              console.log(`打工赢红包 奖励领取成功，京币：${data['Data']['ddwCoin']}个，红包：${data['Data']['StagePrizeInfo']['strPrizeName'] || 0}\n`);
            } else {
              console.log(`打工赢红包 奖励领取失败: ${data['sErrMsg']}, iRet: ${data['iRet']}\n`)
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
async function buildAction() {
  if ($.buildInfo && $.buildInfo.hasOwnProperty('buildList')) {
    const { buildList } = $.buildInfo;
    buildList.sort(sortBuildLvl);//按建筑等级从低到高排序，均衡升级发展
    for (let build of buildList) {
      $.canCreateBuild = false;
      const body = `strBuildIndex=${build['strBuildIndex']}&dwType=1`;
      const strBuildIndex = build['strBuildIndex'] === 'food' ? '京喜美食城' : build['strBuildIndex'] === 'sea' ? '京喜旅馆' : build['strBuildIndex'] === 'shop' ? '京喜商店' : build['strBuildIndex'] === 'fun' ? '京喜游乐场' : `未知建筑 ${build['strBuildIndex']}`;
      await CollectCoin(body, strBuildIndex);
      await $.wait(3000);
      if (new Date().getHours() === 0) {
        //0点收取两次京币，可完成 收8次京币 任务
        await CollectCoin(body, strBuildIndex);
        await $.wait(3000);
      }
      if ($.canCreateBuild) await createbuild(`strBuildIndex=${build['strBuildIndex']}`, strBuildIndex);
    }
    console.log(`\n\n`);
    for (let build of buildList) {
      const body = `strBuildIndex=${build['strBuildIndex']}`;
      const strBuildIndex = build['strBuildIndex'] === 'food' ? '京喜美食城' : build['strBuildIndex'] === 'sea' ? '京喜旅馆' : build['strBuildIndex'] === 'shop' ? '京喜商店' : build['strBuildIndex'] === 'fun' ? '京喜游乐场' : `未知 ${build['strBuildIndex']}`;
      await BuildLvlUp(body, strBuildIndex);
      await $.wait(1000);
    }
  }
}
function CollectCoin(body, strBuildIndex) {
  return new Promise(async (resolve) => {
    const options = taskUrl('user/CollectCoin', body, '_cfd_t,bizCode,dwEnv,dwType,ptag,source,strBuildIndex,strZone');
    $.get(options, async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} activeScene API请求失败，请检查网路重试`)
        } else {
          data = $.toObj(data);
          if (data) {
            if (data['iRet'] === 0) {
              console.log(`${strBuildIndex} 收取京币成功: ${data['ddwCoin']}，当前已有京币：${(data['ddwCoinBalance'] / 10000).toFixed(1)}万`);
            } else {
              console.log(`${strBuildIndex} 收取京币 失败: ${data['sErrMsg']}, iRet: ${data['iRet']}`)
              if (data['iRet'] === 2008) {
                console.log(`开始建造 ${strBuildIndex}`);
                $.canCreateBuild = true;
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
function createbuild(body, strBuildIndex) {
  return new Promise(async (resolve) => {
    const options = taskUrl('user/createbuilding', body, '_cfd_t,bizCode,dwEnv,ptag,source,strBuildIndex,strZone');
    $.get(options, async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} activeScene API请求失败，请检查网路重试`)
        } else {
          data = $.toObj(data);
          if (data) {
            if (data['iRet'] === 0) {
              console.log(`${strBuildIndex} 建造成功\n`);
            } else {
              console.log(`${strBuildIndex} 建造失败: ${data['sErrMsg']}, iRet: ${data['iRet']}\n`)
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
async function BuildLvlUp(body, strBuildIndexText) {
  const buildInfo = await GetBuildInfo(body, strBuildIndexText);
  if (buildInfo) {
    if (buildInfo['iRet'] === 0) {
      const { dwCanLvlUp, ddwNextLvlCostCoin, strBuildIndex, dwBuildLvl } = buildInfo;
      console.log(`查询${strBuildIndexText} 信息成功: 当前等级：${dwBuildLvl}，升级需要金币：${(ddwNextLvlCostCoin / 10000).toFixed(1)}万${dwCanLvlUp === 1 ? '' : '\n'}`);
      if (dwCanLvlUp === 1) {
        console.log(`${strBuildIndexText} 可升级`);
        const buildUpBody = `ddwCostCoin=${ddwNextLvlCostCoin}&strBuildIndex=${strBuildIndex}`;
        await $.wait(2000);
        await BuildLvlUpApi(buildUpBody, strBuildIndexText);
      }
    } else {
      console.log(`查询 ${strBuildIndexText} 信息失败: ${data['sErrMsg']}, iRet: ${data['iRet']}\n`);
    }
  }
}
//查询建筑信息
function GetBuildInfo(body, strBuildIndex) {
  return new Promise(async (resolve) => {
    const options = taskUrl('user/GetBuildInfo', body, '_cfd_t,bizCode,dwEnv,dwType,ptag,source,strBuildIndex,strZone');
    $.get(options, async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} activeScene API请求失败，请检查网路重试`)
        } else {
          data = $.toObj(data);
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data)
      }
    })
  });
}
//升级建筑api
function BuildLvlUpApi(body, strBuildIndex) {
  return new Promise(async (resolve) => {
    const options = taskUrl('user/BuildLvlUp', body, '_cfd_t,bizCode,ddwCostCoin,dwEnv,ptag,source,strBuildIndex,strZone');
    $.get(options, async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} activeScene API请求失败，请检查网路重试`)
        } else {
          data = $.toObj(data);
          if (data) {
            if (data['iRet'] === 0) {
              console.log(`${strBuildIndex} 升级成功，当前等级: ${data['dwBuildLvl']}\n`);
            } else {
              console.log(`${strBuildIndex} 升级失败: ${data['sErrMsg']}, iRet: ${data['iRet']}\n`)
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
//雇佣功能
function EmployTourGuideFun() {
  return new Promise(async (resolve) => {
    const options = taskUrl('user/EmployTourGuideInfo', '', '_cfd_t,bizCode,dwEnv,ptag,source,strZone');
    $.get(options, async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} activeScene API请求失败，请检查网路重试`)
        } else {
          data = $.toObj(data);
          if (data) {
            if (data['iRet'] === 0) {
              const { TourGuideList, strSecSkillName, dwRemainGuideCnt } = data;
              console.log(`\n雇佣导游，${strSecSkillName}`)
              console.log(`当前可雇佣导游：${dwRemainGuideCnt || 0}个`);
              if (TourGuideList && TourGuideList.length) {
                for (let TourGuide of getRandomArrayElements(TourGuideList, TourGuideList.length)) {
                  if (TourGuide['ddwTotalWorkTm'] > 0) {
                    console.log(`导游 【${TourGuide['strGuideName']}】 雇佣中，结束时间：${$.time('yyyy-MM-dd HH:mm:ss', TourGuide['ddwRemainTm'] * 1000)}`);
                    continue
                  }
                  if (dwRemainGuideCnt <= 0) continue
                  if (TourGuide['dwFreeMin'] > 0) {
                    //可试用
                    console.log(`试用 ${TourGuide['strGuideName']} ${TourGuide['strSkillDesc']}`);
                    const body = `strBuildIndex=${TourGuide['strBuildIndex']}&dwIsFree=1&ddwConsumeCoin=0`
                    await EmployTourGuide(body);
                    await $.wait(2000)
                  } else {
                    console.log(`雇佣 ${TourGuide['strGuideName']} ${TourGuide['strSkillDesc']}`);
                    const body = `strBuildIndex=${TourGuide['strBuildIndex']}&dwIsFree=0&ddwConsumeCoin=${TourGuide['ddwCostCoin']}`
                    await EmployTourGuide(body);
                    await $.wait(2000)
                  }
                }
              }
            } else {
              console.log(`查询找导游信息 失败: ${data['sErrMsg']}, iRet: ${data['iRet']}`)
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
function EmployTourGuide(body) {
  return new Promise(async (resolve) => {
    const options = taskUrl('user/EmployTourGuide', body, '_cfd_t,bizCode,ddwConsumeCoin,dwEnv,dwIsFree,ptag,source,strBuildIndex,strZone');
    $.get(options, async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} activeScene API请求失败，请检查网路重试`)
        } else {
          data = $.toObj(data);
          if (data) {
            if (data['iRet'] === 0) {
              console.log(`雇佣成功，在【${data['Data']['strBuildIndex']}】工作${data['Data']['ddwTotalWorkTm'] / 60}分钟\n`);
            } else {
              console.log(`雇佣 失败: ${data['sErrMsg']}, iRet: ${data['iRet']}\n`);
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
//助力API
function helpbystage(strShareId) {
  return new Promise(async (resolve) => {
    const options = taskUrl('story/helpbystage', `strShareId=${strShareId}`, '_cfd_t,bizCode,dwEnv,ptag,source,strShareId,strZone');
    $.get(options, async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} activeScene API请求失败，请检查网路重试`)
        } else {
          data = $.toObj(data);
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
  const strType = type === 1 ? '珍珠' : type === 2 ? '小海螺' : type === 3 ? '大海螺' : type === 4 ? '海星' : '全部贝壳'
  return new Promise(async (resolve) => {
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
                  //如果多个同时卖出：strTypeCnt=3:2|4:6&dwSceneId=1
                  //卖给收藏家：dwSceneId = 2，自己主动售卖：dwSceneId = 1
                  let strTypeCnt = '', dwCount = 0, body = '';
                  if (dwSceneId === 1) {
                    //出售单个贝壳
                    const s = Office.filter(vo => vo['dwType'] === type);
                    if (s && s.length) {
                      const count = dwCount = randomNum(20, 40);//不卖掉全部贝壳，随机卖掉一些。
                      strTypeCnt = `${s[0]['dwType']}:${count}`;
                    }
                  } else {
                    for (let index = 0; index < Office.length; index ++) {
                      strTypeCnt += `${Office[index]['dwType']}:${Office[index]['dwCount']}${index + 1 === Office.length ? '' : '|'}`;
                      dwCount = dwCount + Office[index]['dwCount'];
                    }
                  }
                  body = `strTypeCnt=${encodeURIComponent(strTypeCnt)}&dwSceneId=${dwSceneId}`;
                  if (body) {
                    console.log(`准备出售 ${strType}，共计：${dwCount}个`);
                    await sellgoods(body, dwSceneId === 1 ? type : 0);
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
function taskUrl(function_path, body = '', stk = '') {
  let url = `${JD_API_HOST}/jxbfd/${function_path}?strZone=jxbfd&bizCode=jxbfd&source=jxbfd&dwEnv=7&_cfd_t=${Date.now()}&ptag=&${body}&_stk=${encodeURIComponent(stk)}&_ste=1`;
  if (['Award'].includes(function_path)) {
    //bizCode=jxbfddch 不同
    url = `${JD_API_HOST}/newtasksys/newtasksys_front/${function_path}?strZone=jxbfd&bizCode=jxbfddch&source=jxbfd&dwEnv=7&_cfd_t=${Date.now()}&ptag=&${body}&_stk=${encodeURIComponent(stk)}&_ste=1`;
  }
  if (['ComposeGameAddProcess', 'ComposeGameAward'].includes(function_path)) {
    url = `${JD_API_HOST}/jxbfd/${function_path}?strZone=jxbfd&_t=${Date.now()}&${body}&_stk=${encodeURIComponent(stk)}&_ste=1`;
  }
  url += `&h5st=${decrypt(Date.now(), stk, '', url)}&_=${Date.now() + 2}&sceneval=2&g_login_type=1&g_ty=ls`;
  return {
    url,
    headers: {
      "Cookie": cookie,
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
function taskListUrl(function_path, body = '', stk = '') {
  let url = `${JD_API_HOST}/newtasksys/newtasksys_front/${function_path}?strZone=jxbfd&bizCode=jxbfd&source=jxbfd&dwEnv=7&_cfd_t=${Date.now()}&ptag=&${body}&_stk=${encodeURIComponent(stk)}&_ste=1`;
  url += `&h5st=${decrypt(Date.now(), stk, '', url)}&_=${Date.now() + 2}&sceneval=2&g_login_type=1&g_ty=ls`;
  return {
    url,
    headers: {
      "Cookie": cookie,
      "Accept": "*/*",
      "Connection": "keep-alive",
      "Referer":"https://st.jingxi.com/fortune_island/index.html?ptag=138631.26.55",
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
/**
 * 从arr数组里面随机取 count个出来
 * @param arr
 * @param count
 * @returns {Buffer}
 */
function getRandomArrayElements(arr, count) {
  let shuffled = arr.slice(0), i = arr.length, min = i - count, temp, index;
  while (i-- > min) {
    index = Math.floor((i + 1) * Math.random());
    temp = shuffled[index];
    shuffled[index] = shuffled[i];
    shuffled[i] = temp;
  }
  return shuffled.slice(min);
}

/**
 * 建筑等级从低到高排序
 * @param a
 * @param b
 * @returns {number}
 */
function sortBuildLvl(a, b) {
  return a['dwLvl'] - b['dwLvl']
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