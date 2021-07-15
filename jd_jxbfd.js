/*
新版京喜财富岛，未完
 */
const $ = new Env("京喜财富岛");
const JD_API_HOST = "https://m.jingxi.com";
const notify = $.isNode() ? require('./sendNotify') : {};
const jdCookieNode = $.isNode() ? require("./jdCookie.js") : {};
let cookiesArr = [], cookie = '', token = '';
$.appId = 10032;

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
})();
async function main() {
  try {
    $.accountFlag = true;
    $.SpeedUpFlag = 0;
    await QueryUserInfo();
    //账号火爆或者未开启财富岛活动，退出
    if (!$.accountFlag) return
    await storyOper();//轮船功能
    await GetActTask();
    await pickShells();//海滩捡贝壳海螺等
    await doTasks();//任务赚京币&成就赚财富
    await rewardSign();//连续营业赢红包
    await buildAction();//建筑升级与收集金币
    await SpeedUp();//接待游客
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
              console.log(`已接待游客: ${data['buildInfo']['dwTodaySpeedPeople']}/20\n`);
              $.buildInfo = data['buildInfo'];
              $.StoryInfo = data['StoryInfo'];
              if (data['dwOfficeUnLock'] === 0) {
                console.log(`\n当前账号未开启 财富岛活动\n`);
                $.accountFlag = false;
              }
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
              if (data['dwTodaySpeedPeople']) {
                console.log(`今日已接待游客: ${data['dwTodaySpeedPeople']}/20`);
                $.SpeedUpFlag ++;
                if ($.SpeedUpFlag < 20) {
                  await wait(2000);
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
                  await wait(1000);
                }
              }
            } else {
              console.log(`GetActTask 获取任务列表失败: ${data['sErrMsg']}, iRet: ${data['iRet']}`)
              if (data['iRet'] === 1022) $.SpeedUpFlag = false;
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
      if (strStoryId && dwStatus === 1) {
        if (dwType === 4) {
          console.log(`${story['Collector']['strRecvDesc']}\n`);
          const body = `strStoryId=${strStoryId}&dwType=2&ddwTriggerDay=${ddwTriggerDay}`;
          await CollectorOper('CollectorOper', body, '_cfd_t,bizCode,ddwTriggerDay,dwEnv,dwType,ptag,source,strStoryId,strZone');
          await pickShells();
        } else if (dwType === 1) {
          console.log(`${story['Special']['strTalk']}\n`);
          let body = `strStoryId=${strStoryId}&dwType=2&ddwTriggerDay=${ddwTriggerDay}&triggerType=${story['Special']['triggerType']}`;
          await CollectorOper('SpecialUserOper', body, `_cfd_t,bizCode,ddwTriggerDay,dwEnv,dwType,ptag,source,strStoryId,strZone,triggerType`);
          await wait(31 * 1000);
          body = `strStoryId=${strStoryId}&dwType=3&ddwTriggerDay=${ddwTriggerDay}&triggerType=${story['Special']['triggerType']}`;
          await CollectorOper('SpecialUserOper', body, `_cfd_t,bizCode,ddwTriggerDay,dwEnv,dwType,ptag,source,strStoryId,strZone,triggerType`);
        } else {
          console.log(`未知状态，dwType：${dwType}，${$.toStr(story)}\n`);
        }
      }
    }
  }
}
//沙滩上捡贝壳
async function pickShells() {
  const queryShell = await pickshell();
  if (queryShell) {
    if (queryShell['iRet'] === 0) {
      $.pickshellFlag = true;
      const { NormShell } = queryShell['Data'];
      for (let item of NormShell) {
        if (item['dwNum'] && item['dwNum'] > 0) {
          for (let i = 0; i < new Array(item['dwNum']).fill('').length; i++) {
            await pickshell(`dwType=${item['dwType']}`, item['dwType']);//珍珠
            await wait(1000);
          }
        }
      }
    } else {
      console.log(`查询沙滩信息 失败: ${queryShell['sErrMsg']}, iRet: ${queryShell['iRet']}`)
      if (queryShell['iRet'] === 2219) $.pickshellFlag = false;
    }
  }
}
function CollectorOper(funtionId, body, stk = '') {
  return new Promise(async (resolve) => {
    let options = taskUrl(`story/${funtionId}`, body, stk);
    $.get(options, async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} activeScene API请求失败，请检查网路重试`)
        } else {
          console.log(funtionId, data);
          data = $.toObj(data);
          if (data) {
            if (data['iRet'] === 0) {
              console.log(`${funtionId} 成功！\n`);
            } else {
              console.log(`${funtionId} 失败: ${data['sErrMsg']}, iRet: ${data['iRet']}`)
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
              if (data['iRet'] === 2219) $.pickshellFlag = false;
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
              for (let task of tasks) {
                console.log(`【${task.taskName}】任务进度：${task.completedTimes}/${task.targetTimes}`);
                if ((task.completedTimes === task.targetTimes) && task.awardStatus === 2) {
                  console.log(`开始领取 【${task.taskName}】任务奖励`)
                  await Award(task['taskId'], 'newtasksys')
                  await wait(1000);
                } else if (task.awardStatus === 2 && task.completedTimes < task.targetTimes) {
                  if (task['taskType'] === 6 || task['taskType'] === 15 || task['taskType'] === 14) {
                    // console.log('【任务赚京币】', task['taskName'], task['taskType'])
                    for (let i = 0; i < (task.targetTimes - task.completedTimes); i++) {
                      console.log(`开始做 【${task.taskName}】任务`);
                      await DoTask(task['taskId']);
                      await wait(5000);
                    }
                  } else {
                    // console.log('【成就赚财富】', task['taskName'], 'taskType：' + task['taskType'])
                  }
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
      console.log(`\n连续营业赢红包 奖励已领取\n`);
    } else {
      let ddwCoin = 0, ddwMoney = 0, dwPrizeType = 0, dwPrizeLv = 0;
      for (let sign of SignList) {
        if (dwTodayId === sign['dwDayId']) {
          ddwCoin = sign['ddwCoin'];
          ddwMoney = sign['ddwMoney'];
          dwPrizeType = sign['dwPrizeType'];
          dwPrizeLv = sign['dwBingoLevel'];
        }
      }
      const body = `ddwCoin=${ddwCoin}&ddwMoney=${ddwMoney}&dwPrizeType=${dwPrizeType}&strPrizePool=&dwPrizeLv=${dwPrizeLv}`;
      await RewardSign(body);
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
    let options = taskUrl('story/RewardSign', body, '_cfd_t,bizCode,ddwCoin,ddwMoney,dwEnv,dwPrizeLv,dwPrizeType,ptag,source,strPrizePool,strZone');
    $.get(options, (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} activeScene API请求失败，请检查网路重试`)
        } else {
          data = $.toObj(data);
          if (data) {
            if (data['iRet'] === 0) {
              console.log(`连续营业赢红包 奖励领取成功，京币：${data['Data']['ddwCoin']}，红包：${data['Data']['ddwMoney']}\n`);
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
async function buildAction() {
  if ($.buildInfo && $.buildInfo.hasOwnProperty('buildList')) {
    const { buildList } = $.buildInfo;
    for (let build of buildList) {
      const body = `strBuildIndex=${build['strBuildIndex']}&dwType=1`;
      const strBuildIndex = build['strBuildIndex'] === 'food' ? '京喜美食城' : build['strBuildIndex'] === 'sea' ? '京喜旅馆' : build['strBuildIndex'] === 'shop' ? '京喜商店' : build['strBuildIndex'] === 'fun' ? '京喜游乐场' : `未知 ${build['strBuildIndex']}`;
      await CollectCoin(body, strBuildIndex);
      await wait(3000);
    }
    console.log(`\n\n`);
    for (let build of buildList) {
      const body = `strBuildIndex=${build['strBuildIndex']}`;
      const strBuildIndex = build['strBuildIndex'] === 'food' ? '京喜美食城' : build['strBuildIndex'] === 'sea' ? '京喜旅馆' : build['strBuildIndex'] === 'shop' ? '京喜商店' : build['strBuildIndex'] === 'fun' ? '京喜游乐场' : `未知 ${build['strBuildIndex']}`;
      await BuildLvlUp(body, strBuildIndex);
      await wait(1000);
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
              console.log(`${strBuildIndex} 收取京币成功: ${data['ddwCoin']}，当前已有京币：${data['ddwCoinBalance']}`);
            } else {
              console.log(`${strBuildIndex} 收取京币 失败: ${data['sErrMsg']}, iRet: ${data['iRet']}`)
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
      console.log(`查询${strBuildIndexText} 信息成功: 当前等级：${dwBuildLvl}，升级需要：${ddwNextLvlCostCoin}金币${dwCanLvlUp === 1 ? '' : '\n'}`);
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
function taskUrl(function_path, body = '', stk = '') {
  let url = `${JD_API_HOST}/jxbfd/${function_path}?strZone=jxbfd&bizCode=jxbfd&source=jxbfd&dwEnv=7&_cfd_t=${Date.now()}&ptag=&${body}&_stk=${encodeURIComponent(stk)}&_ste=1`;
  if (['Award'].includes(function_path)) {
    //bizCode=jxbfddch 不同
    url = `${JD_API_HOST}/newtasksys/newtasksys_front/${function_path}?strZone=jxbfd&bizCode=jxbfddch&source=jxbfd&dwEnv=7&_cfd_t=${Date.now()}&ptag=&${body}&_stk=${encodeURIComponent(stk)}&_ste=1`;
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
      "User-Agent":`jdpingou;iPhone;3.15.2;14.2.1;ea00763447803eb0f32045dcba629c248ea53bb3;network/wifi;model/iPhone13,2;appBuild/100365;ADID/00000000-0000-0000-0000-000000000000;supportApplePay/1;hasUPPay/0;pushNoticeIsOpen/0;hasOCPay/0;supportBestPay/0;session/${Math.random * 98 + 1};pap/JA2015_311210;brand/apple;supportJDSHWK/1;Mozilla/5.0 (iPhone; CPU iPhone OS 14_2_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148`,
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
      "User-Agent":`jdpingou;iPhone;3.15.2;14.2.1;ea00763447803eb0f32045dcba629c248ea53bb3;network/wifi;model/iPhone13,2;appBuild/100365;ADID/00000000-0000-0000-0000-000000000000;supportApplePay/1;hasUPPay/0;pushNoticeIsOpen/0;hasOCPay/0;supportBestPay/0;session/${Math.random * 98 + 1};pap/JA2015_311210;brand/apple;supportJDSHWK/1;Mozilla/5.0 (iPhone; CPU iPhone OS 14_2_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148`,
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
  new Promise(async resolve => {
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

function getQueryString(url, name) {
  let reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
  let r = url.split('?')[1].match(reg);
  if (r != null) return unescape(r[2]);
  return '';
}

function wait(t) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, t);
  });
}
// prettier-ignore
function Env(t,e){"undefined"!=typeof process&&JSON.stringify(process.env).indexOf("GITHUB")>-1&&process.exit(0);class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}