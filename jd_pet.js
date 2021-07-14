/*
东东萌宠 更新地址： jd_pet.js
更新时间：2021-05-21
活动入口：京东APP我的-更多工具-东东萌宠
已支持IOS多京东账号,Node.js支持N个京东账号
脚本兼容: QuantumultX, Surge, Loon, JSBox, Node.js

互助码shareCode请先手动运行脚本查看打印可看到
一天只能帮助5个人。多出的助力码无效

=================================Quantumultx=========================
[task_local]
#东东萌宠
15 6-18/6 * * * jd_pet.js, tag=东东萌宠, img-url=https://raw.githubusercontent.com/58xinian/icon/master/jdmc.png, enabled=true

=================================Loon===================================
[Script]
cron "15 6-18/6 * * *" script-path=jd_pet.js,tag=东东萌宠

===================================Surge================================
东东萌宠 = type=cron,cronexp="15 6-18/6 * * *",wake-system=1,timeout=3600,script-path=jd_pet.js

====================================小火箭=============================
东东萌宠 = type=cron,script-path=jd_pet.js, cronexpr="15 6-18/6 * * *", timeout=3600, enable=true

*/
const $ = new Env('东东萌宠');
let cookiesArr = [], cookie = '', jdPetShareArr = [], isBox = false, notify, newShareCodes, allMessage = '';
//助力好友分享码(最多5个,否则后面的助力失败),原因:京东农场每人每天只有四次助力机会
//此此内容是IOS用户下载脚本到本地使用，填写互助码的地方，同一京东账号的好友互助码请使用@符号隔开。
//下面给出两个账号的填写示例（iOS只支持2个京东账号）
let shareCodes = [ // IOS本地脚本用户这个列表填入你要助力的好友的shareCode
   //账号一的好友shareCode,不同好友的shareCode中间用@符号隔开
  'MTEyOTEzNzMzMDAwMDAwMDUwNzc4MTIx@MTAxODc2NTEzNTAwMDAwMDAyNzY1ODE4NQ==',
  //账号二的好友shareCode,不同好友的shareCode中间用@符号隔开
  // 'MTAxODc2NTEzMjAwMDAwMDAzMDI3MTMyOQ==@MTAxODcxOTI2NTAwMDAwMDAyNjA4ODQyMQ==@MTAxODc2NTEzOTAwMDAwMDAyNzE2MDY2NQ==@MTE1NDUyMjEwMDAwMDAwNDI0MDM2MDc=@MTAxODc2NTEzMjAwMDAwMDAwNDA5MzAzMw==',
]
let message = '', subTitle = '', option = {};
let jdNotify = false;//是否关闭通知，false打开通知推送，true关闭通知推送
const JD_API_HOST = 'https://api.m.jd.com/client.action';
let goodsUrl = '', taskInfoKey = [];
let randomCount = $.isNode() ? 20 : 5;
!(async () => {
  await requireConfig();
  if (!cookiesArr[0]) {
    $.msg($.name, '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/bean/signIndex.action', {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});
    return;
  }
  for (let i = 0; i < cookiesArr.length; i++) {
    if (cookiesArr[i]) {
      cookie = cookiesArr[i];
      $.UserName = decodeURIComponent(cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1])
      $.index = i + 1;
      $.isLogin = true;
      $.nickName = '';
      await TotalBean();
      console.log(`\n开始【京东账号${$.index}】${$.nickName || $.UserName}\n`);
      if (!$.isLogin) {
        $.msg($.name, `【提示】cookie已失效`, `京东账号${$.index} ${$.nickName || $.UserName}\n请重新登录获取\nhttps://bean.m.jd.com/bean/signIndex.action`, {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});

        if ($.isNode()) {
          await notify.sendNotify(`${$.name}cookie已失效 - ${$.UserName}`, `京东账号${$.index} ${$.UserName}\n请重新登录获取cookie`);
        }
        continue
      }
      message = '';
      subTitle = '';
      goodsUrl = '';
      taskInfoKey = [];
      option = {};
      await shareCodesFormat();
      await jdPet();
    }
  }
  if ($.isNode() && allMessage && $.ctrTemp) {
    await notify.sendNotify(`${$.name}`, `${allMessage}`)
  }
})()
    .catch((e) => {
      $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
    })
    .finally(() => {
      $.done();
    })
async function jdPet() {
  try {
    //查询jd宠物信息
    const initPetTownRes = await request('initPetTown');
    message = `【京东账号${$.index}】${$.nickName}\n`;
    if (initPetTownRes) {
        if (initPetTownRes.code === '0' && initPetTownRes.resultCode === '0' && initPetTownRes.message === 'success') {
            $.petInfo = initPetTownRes.result;
            if ($.petInfo.userStatus === 0) {
                // $.msg($.name, '', `【提示】京东账号${$.index}${$.nickName}\n萌宠活动未开启\n请手动去京东APP开启活动\n入口：我的->游戏与互动->查看更多开启`, { "open-url": "openapp.jdmoble://" });
                await slaveHelp();//助力好友
                $.log($.name, '', `【提示】京东账号${$.index}${$.nickName}\n萌宠活动未开启\n请手动去京东APP开启活动\n入口：我的->游戏与互动->查看更多开启`);
                return
            }
            if (!$.petInfo.goodsInfo) {
                $.msg($.name, '', `【提示】京东账号${$.index}${$.nickName}\n暂未选购新的商品`, { "open-url": "openapp.jdmoble://" });
                if ($.isNode()) await notify.sendNotify(`${$.name} - ${$.index} - ${$.nickName}`, `【提示】京东账号${$.index}${$.nickName}\n暂未选购新的商品`);
                return
            }
            goodsUrl = $.petInfo.goodsInfo && $.petInfo.goodsInfo.goodsUrl;
            // option['media-url'] = goodsUrl;
            // console.log(`初始化萌宠信息完成: ${JSON.stringify(petInfo)}`);
            if ($.petInfo.petStatus === 5) {
                await slaveHelp();//可以兑换而没有去兑换,也能继续助力好友
                option['open-url'] = "openApp.jdMobile://";
                $.msg($.name, ``, `【京东账号${$.index}】${$.nickName || $.UserName}\n【提醒⏰】${$.petInfo.goodsInfo.goodsName}已可领取\n请去京东APP或微信小程序查看\n点击弹窗即达`, option);
                if ($.isNode()) {
                    await notify.sendNotify(`${$.name} - 账号${$.index} - ${$.nickName || $.UserName}奖品已可领取`, `京东账号${$.index} ${$.nickName}\n${$.petInfo.goodsInfo.goodsName}已可领取`);
                }
                return
            } else if ($.petInfo.petStatus === 6) {
                await slaveHelp();//已领取红包,但未领养新的,也能继续助力好友
                option['open-url'] = "openApp.jdMobile://";
                $.msg($.name, ``, `【京东账号${$.index}】${$.nickName || $.UserName}\n【提醒⏰】已领取红包,但未继续领养新的物品\n请去京东APP或微信小程序查看\n点击弹窗即达`, option);
                if ($.isNode()) {
                    await notify.sendNotify(`${$.name} - 账号${$.index} - ${$.nickName || $.UserName}奖品已可领取`, `京东账号${$.index} ${$.nickName}\n已领取红包,但未继续领养新的物品`);
                }
                return
            }
            console.log(`\n【京东账号${$.index}（${$.UserName}）的${$.name}好友互助码】${$.petInfo.shareCode}\n`);
            await taskInit();
            if ($.taskInit.resultCode) {
                if ($.taskInit.resultCode === '9999' || !$.taskInit.result) {
                    console.log('初始化任务异常, 请稍后再试');
                    return
                }
                $.taskInfo = $.taskInit.result;
            }

            await petSport();//遛弯
            await slaveHelp();//助力好友
            await masterHelpInit();//获取助力的信息
            await doTask();//做日常任务
            await feedPetsAgain();//再次投食
            await energyCollect();//收集好感度
            await showMsg();
            console.log('全部任务完成, 如果帮助到您可以点下🌟STAR鼓励我一下, 明天见~');
        } else if (initPetTownRes.code === '0'){
            console.log(`初始化萌宠失败:  ${initPetTownRes.message}`);
        }
    }
    else {
        console.log("当前执行失败，等待3秒进行下次执行！")
        await $.wait(3000);  // 增加延迟避免报错
    }

  } catch (e) {
    $.logErr(e)
    const errMsg = `京东账号${$.index} ${$.nickName || $.UserName}\n任务执行异常，请检查执行日志 ‼️‼️`;
    if ($.isNode()) await notify.sendNotify(`${$.name}`, errMsg);
    $.msg($.name, '', `${errMsg}`)
  }
}
// 收取所有好感度
async function energyCollect() {
  console.log('开始收取任务奖励好感度');
  let function_id = arguments.callee.name.toString();
  const response = await request(function_id);
  // console.log(`收取任务奖励好感度完成:${JSON.stringify(response)}`);
  if (response.resultCode === '0') {
    message += `【第${response.result.medalNum + 1}块勋章完成进度】${response.result.medalPercent}%，还需收集${response.result.needCollectEnergy}好感\n`;
    message += `【已获得勋章】${response.result.medalNum}块，还需收集${response.result.needCollectMedalNum}块即可兑换奖品“${$.petInfo.goodsInfo.goodsName}”\n`;
  }
}
//再次投食
async function feedPetsAgain() {
  const response = await request('initPetTown');//再次初始化萌宠
  if (response.code === '0' && response.resultCode === '0' && response.message === 'success') {
    $.petInfo = response.result;
    let foodAmount = $.petInfo.foodAmount; //剩余狗粮
    if (foodAmount - 100 >= 10) {
      for (let i = 0; i < parseInt((foodAmount - 100) / 10); i++) {
        const feedPetRes = await request('feedPets');
        console.log(`投食feedPetRes`);
        if (feedPetRes.resultCode == 0 && feedPetRes.code == 0) {
          console.log('投食成功')
        }
        await $.wait(3000);  // 增加延迟避免报错
      }
      const response2 = await request('initPetTown');
      $.petInfo = response2.result;
      subTitle = $.petInfo.goodsInfo.goodsName;
      // message += `【与爱宠相识】${$.petInfo.meetDays}天\n`;
      // message += `【剩余狗粮】${$.petInfo.foodAmount}g\n`;
    } else {
      console.log("目前剩余狗粮：【" + foodAmount + "】g,不再继续投食,保留部分狗粮用于完成第二天任务");
      subTitle = $.petInfo.goodsInfo && $.petInfo.goodsInfo.goodsName;
      // message += `【与爱宠相识】${$.petInfo.meetDays}天\n`;
      // message += `【剩余狗粮】${$.petInfo.foodAmount}g\n`;
    }
  } else {
    console.log(`初始化萌宠失败:  ${JSON.stringify($.petInfo)}`);
  }
}


async function doTask() {
  const { signInit, threeMealInit, firstFeedInit, feedReachInit, inviteFriendsInit, browseShopsInit, taskList } = $.taskInfo;
  for (let item of taskList) {
    if ($.taskInfo[item].finished) {
      console.log(`任务 ${item} 已完成`)
    }
    await $.wait(3000);  // 增加延迟避免报错
  }
  //每日签到
  if (signInit && !signInit.finished) {
    await signInitFun();
  }
  // 首次喂食
  if (firstFeedInit && !firstFeedInit.finished) {
    await firstFeedInitFun();
  }
  // 三餐
  if (threeMealInit && !threeMealInit.finished) {
    if (threeMealInit.timeRange === -1) {
      console.log(`未到三餐时间`);
    } else {
      await threeMealInitFun();
    }
  }
  if (browseShopsInit && !browseShopsInit.finished) {
    await browseShopsInitFun();
  }
  let browseSingleShopInitList = [];
  taskList.map((item) => {
    if (item.indexOf('browseSingleShopInit') > -1) {
      browseSingleShopInitList.push(item);
    }
  });
  // 去逛逛好货会场
  for (let item of browseSingleShopInitList) {
    const browseSingleShopInitTask = $.taskInfo[item];
    if (browseSingleShopInitTask && !browseSingleShopInitTask.finished) {
      await browseSingleShopInit(browseSingleShopInitTask);
    }
    await $.wait(3000);  // 增加延迟避免报错
  }
  if (inviteFriendsInit && !inviteFriendsInit.finished) {
    await inviteFriendsInitFun();
  }
  // 投食10次
  if (feedReachInit && !feedReachInit.finished) {
    await feedReachInitFun();
  }
}
// 好友助力信息
async function masterHelpInit() {
  let res = await request(arguments.callee.name.toString());
  // console.log(`助力信息: ${JSON.stringify(res)}`);
  if (res.code === '0' && res.resultCode === '0') {
    if (res.result.masterHelpPeoples && res.result.masterHelpPeoples.length >= 5) {
      if(!res.result.addedBonusFlag) {
        console.log("开始领取额外奖励");
        let getHelpAddedBonusResult = await request('getHelpAddedBonus');
        if (getHelpAddedBonusResult.resultCode === '0') {
          message += `【额外奖励${getHelpAddedBonusResult.result.reward}领取】${getHelpAddedBonusResult.message}\n`;
        }
        console.log(`领取30g额外奖励结果：【${getHelpAddedBonusResult.message}】`);
      } else {
        console.log("已经领取过5好友助力额外奖励");
        message += `【额外奖励】已领取\n`;
      }
    } else {
      console.log("助力好友未达到5个")
      message += `【额外奖励】领取失败，原因：给您助力的人未达5个\n`;
    }
    if (res.result.masterHelpPeoples && res.result.masterHelpPeoples.length > 0) {
      console.log('帮您助力的好友的名单开始')
      let str = '';
      res.result.masterHelpPeoples.map((item, index) => {
        if (index === (res.result.masterHelpPeoples.length - 1)) {
          str += item.nickName || "匿名用户";
        } else {
          str += (item.nickName || "匿名用户") + '，';
        }
      })
      message += `【助力您的好友】${str}\n`;
    }
  }
}
/**
 * 助力好友, 暂时支持一个好友, 需要拿到shareCode
 * shareCode为你要助力的好友的
 * 运行脚本时你自己的shareCode会在控制台输出, 可以将其分享给他人
 */
async function slaveHelp() {
  //$.log(`\n因1.6日好友助力功能下线。故暂时屏蔽\n`)
  //return
  let helpPeoples = '';
  for (let code of newShareCodes) {
    console.log(`开始助力京东账号${$.index} - ${$.nickName}的好友: ${code}`);
    if (!code) continue;
    let response = await request(arguments.callee.name.toString(), {'shareCode': code});
    if (response.code === '0' && response.resultCode === '0') {
      if (response.result.helpStatus === 0) {
        console.log('已给好友: 【' + response.result.masterNickName + '】助力成功');
        helpPeoples += response.result.masterNickName + '，';
      } else if (response.result.helpStatus === 1) {
        // 您今日已无助力机会
        console.log(`助力好友${response.result.masterNickName}失败，您今日已无助力机会`);
        break;
      } else if (response.result.helpStatus === 2) {
        //该好友已满5人助力，无需您再次助力
        console.log(`该好友${response.result.masterNickName}已满5人助力，无需您再次助力`);
      } else {
        console.log(`助力其他情况：${JSON.stringify(response)}`);
      }
    } else {
      console.log(`助力好友结果: ${response.message}`);
    }
    await $.wait(3000);  // 增加延迟避免报错
  }
  if (helpPeoples && helpPeoples.length > 0) {
    message += `【您助力的好友】${helpPeoples.substr(0, helpPeoples.length - 1)}\n`;
  }
}
// 遛狗, 每天次数上限10次, 随机给狗粮, 每次遛狗结束需调用getSportReward领取奖励, 才能进行下一次遛狗
async function petSport() {
  console.log('开始遛弯');
  let times = 1
  const code = 0
  let resultCode = 0
  do {
    let response = await request(arguments.callee.name.toString())
    console.log(`第${times}次遛狗完成: ${JSON.stringify(response)}`);
    resultCode = response.resultCode;
    if (resultCode == 0) {
      let sportRevardResult = await request('getSportReward');
      console.log(`领取遛狗奖励完成: ${JSON.stringify(sportRevardResult)}`);
    }
    await $.wait(3000);  // 增加延迟尝试解决多次执行就报错的问题
    times++;
  } while (resultCode == 0 && code == 0)
  if (times > 1) {
    // message += '【十次遛狗】已完成\n';
  }
}
// 初始化任务, 可查询任务完成情况
async function taskInit() {
  console.log('开始任务初始化');
  $.taskInit = await request(arguments.callee.name.toString(), {"version":1});
}
// 每日签到, 每天一次
async function signInitFun() {
  console.log('准备每日签到');
  const response = await request("getSignReward");
  console.log(`每日签到结果: ${JSON.stringify(response)}`);
  if (response.code === '0' && response.resultCode === '0') {
    console.log(`【每日签到成功】奖励${response.result.signReward}g狗粮\n`);
    // message += `【每日签到成功】奖励${response.result.signReward}g狗粮\n`;
  } else {
    console.log(`【每日签到】${response.message}\n`);
    // message += `【每日签到】${response.message}\n`;
  }
}

// 三餐签到, 每天三段签到时间
async function threeMealInitFun() {
  console.log('准备三餐签到');
  const response = await request("getThreeMealReward");
  console.log(`三餐签到结果: ${JSON.stringify(response)}`);
  if (response.code === '0' && response.resultCode === '0') {
    console.log(`【定时领狗粮】获得${response.result.threeMealReward}g\n`);
    // message += `【定时领狗粮】获得${response.result.threeMealReward}g\n`;
  } else {
    console.log(`【定时领狗粮】${response.message}\n`);
    // message += `【定时领狗粮】${response.message}\n`;
  }
}

// 浏览指定店铺 任务
async function browseSingleShopInit(item) {
  console.log(`开始做 ${item.title} 任务， ${item.desc}`);
  const body = {"index": item['index'], "version":1, "type":1};
  const body2 = {"index": item['index'], "version":1, "type":2};
  const response = await request("getSingleShopReward", body);
  // console.log(`点击进去response::${JSON.stringify(response)}`);
  if (response.code === '0' && response.resultCode === '0') {
    const response2 = await request("getSingleShopReward", body2);
    // console.log(`浏览完毕领取奖励:response2::${JSON.stringify(response2)}`);
    if (response2.code === '0' && response2.resultCode === '0') {
      console.log(`【浏览指定店铺】获取${response2.result.reward}g\n`);
      // message += `【浏览指定店铺】获取${response2.result.reward}g\n`;
    }
  }
}

// 浏览店铺任务, 任务可能为多个? 目前只有一个
async function browseShopsInitFun() {
  console.log('开始浏览店铺任务');
  let times = 0;
  let resultCode = 0;
  let code = 0;
  do {
    let response = await request("getBrowseShopsReward");
    console.log(`第${times}次浏览店铺结果: ${JSON.stringify(response)}`);
    code = response.code;
    resultCode = response.resultCode;
    times++;
    await $.wait(3000);  // 增加延迟避免报错
  } while (resultCode == 0 && code == 0 && times < 5)
  console.log('浏览店铺任务结束');
}
// 首次投食 任务
function firstFeedInitFun() {
  console.log('首次投食任务合并到10次喂食任务中\n');
}

// 邀请新用户
async function inviteFriendsInitFun() {
  console.log('邀请新用户功能未实现');
  if ($.taskInfo.inviteFriendsInit.status == 1 && $.taskInfo.inviteFriendsInit.inviteFriendsNum > 0) {
    // 如果有邀请过新用户,自动领取60gg奖励
    const res = await request('getInviteFriendsReward');
    if (res.code == 0 && res.resultCode == 0) {
      console.log(`领取邀请新用户奖励成功,获得狗粮现有狗粮${$.taskInfo.inviteFriendsInit.reward}g，${res.result.foodAmount}g`);
      message += `【邀请新用户】获取狗粮${$.taskInfo.inviteFriendsInit.reward}g\n`;
    }
  }
}

/**
 * 投食10次 任务
 */
async function feedReachInitFun() {
  console.log('投食任务开始...');
  let finishedTimes = $.taskInfo.feedReachInit.hadFeedAmount / 10; //已经喂养了几次
  let needFeedTimes = 10 - finishedTimes; //还需要几次
  let tryTimes = 20; //尝试次数
  do {
    console.log(`还需要投食${needFeedTimes}次`);
    const response = await request('feedPets');
    console.log(`本次投食结果: ${JSON.stringify(response)}`);
    if (response) {
        if (response.resultCode == 0 && response.code == 0) {
            needFeedTimes--;
        }
        if (response.resultCode == 3003 && response.code == 0) {
            console.log('剩余狗粮不足, 投食结束');
            needFeedTimes = 0;
        }
        tryTimes--;
    }
    await $.wait(3000);  // 增加延迟避免报错
  } while (needFeedTimes > 0 && tryTimes > 0)
  console.log('投食任务结束...\n');
}
async function showMsg() {
  if ($.isNode() && process.env.PET_NOTIFY_CONTROL) {
    $.ctrTemp = `${process.env.PET_NOTIFY_CONTROL}` === 'false';
  } else if ($.getdata('jdPetNotify')) {
    $.ctrTemp = $.getdata('jdPetNotify') === 'false';
  } else {
    $.ctrTemp = `${jdNotify}` === 'false';
  }
  // jdNotify = `${notify.petNotifyControl}` === 'false' && `${jdNotify}` === 'false' && $.getdata('jdPetNotify') === 'false';
  if ($.ctrTemp) {
    $.msg($.name, subTitle, message, option);
    if ($.isNode()) {
      allMessage += `${subTitle}\n${message}${$.index !== cookiesArr.length ? '\n\n' : ''}`
      // await notify.sendNotify(`${$.name} - 账号${$.index} - ${$.nickName}`, `${subTitle}\n${message}`);
    }
  } else {
    $.log(`\n${message}\n`);
  }
}
function readShareCode() {
  return new Promise(async resolve => {
    $.get({url: `http://share.turinglabs.net/api/v3/pet/query/${randomCount}/`, 'timeout': 10000}, (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (data) {
            console.log(`随机取个${randomCount}码放到您固定的互助码后面(不影响已有固定互助)`)
            data = JSON.parse(data);
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
    await $.wait(10000);
    resolve()
  })
}
function shareCodesFormat() {
  return new Promise(async resolve => {
    // console.log(`第${$.index}个京东账号的助力码:::${$.shareCodesArr[$.index - 1]}`)
    newShareCodes = [];
    if ($.shareCodesArr[$.index - 1]) {
      newShareCodes = $.shareCodesArr[$.index - 1].split('@');
    } else {
      console.log(`由于您第${$.index}个京东账号未提供shareCode,将采纳本脚本自带的助力码\n`)
      const tempIndex = $.index > shareCodes.length ? (shareCodes.length - 1) : ($.index - 1);
      newShareCodes = shareCodes[tempIndex].split('@');
    }
    //因好友助力功能下线。故暂时屏蔽
    // const readShareCodeRes = await readShareCode();
    const readShareCodeRes = null;
    if (readShareCodeRes && readShareCodeRes.code === 200) {
      newShareCodes = [...new Set([...newShareCodes, ...(readShareCodeRes.data || [])])];
    }
    console.log(`第${$.index}个京东账号将要助力的好友${JSON.stringify(newShareCodes)}`)
    resolve();
  })
}
function requireConfig() {
  return new Promise(resolve => {
    console.log('开始获取东东萌宠配置文件\n')
    notify = $.isNode() ? require('./sendNotify') : '';
    //Node.js用户请在jdCookie.js处填写京东ck;
    const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
    const jdPetShareCodes = $.isNode() ? require('./jdPetShareCodes.js') : '';
    //IOS等用户直接用NobyDa的jd cookie
    if ($.isNode()) {
      Object.keys(jdCookieNode).forEach((item) => {
        if (jdCookieNode[item]) {
          cookiesArr.push(jdCookieNode[item])
        }
      })
      if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => {};
    } else {
      cookiesArr = [$.getdata('CookieJD'), $.getdata('CookieJD2'), ...jsonParse($.getdata('CookiesJD') || "[]").map(item => item.cookie)].filter(item => !!item);
    }
    console.log(`共${cookiesArr.length}个京东账号\n`)
    $.shareCodesArr = [];
    if ($.isNode()) {
      Object.keys(jdPetShareCodes).forEach((item) => {
        if (jdPetShareCodes[item]) {
          $.shareCodesArr.push(jdPetShareCodes[item])
        }
      })
    } else {
      if ($.getdata('jd_pet_inviter')) $.shareCodesArr = $.getdata('jd_pet_inviter').split('\n').filter(item => !!item);
      console.log(`\nBoxJs设置的${$.name}好友邀请码:${$.getdata('jd_pet_inviter') ? $.getdata('jd_pet_inviter') : '暂无'}\n`);
    }
    // console.log(`$.shareCodesArr::${JSON.stringify($.shareCodesArr)}`)
    // console.log(`jdPetShareArr账号长度::${$.shareCodesArr.length}`)
    console.log(`您提供了${$.shareCodesArr.length}个账号的东东萌宠助力码\n`);
    resolve()
  })
}
function TotalBean() {
  return new Promise(async resolve => {
    const options = {
      "url": `https://wq.jd.com/user/info/QueryJDUserInfo?sceneval=2`,
      "headers": {
        "Accept": "application/json,text/plain, */*",
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept-Encoding": "gzip, deflate, br",
        "Accept-Language": "zh-cn",
        "Connection": "keep-alive",
        "Cookie": cookie,
        "Referer": "https://wqs.jd.com/my/jingdou/my.shtml?sceneval=2",
        "User-Agent": $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1")
      }
    }
    $.post(options, (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (data) {
            data = JSON.parse(data);
            if (data['retcode'] === 13) {
              $.isLogin = false; //cookie过期
              return
            }
            if (data['retcode'] === 0) {
              $.nickName = (data['base'] && data['base'].nickname) || $.UserName;
            } else {
              $.nickName = $.UserName
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
// 请求
async function request(function_id, body = {}) {
  await $.wait(3000); //歇口气儿, 不然会报操作频繁
  return new Promise((resolve, reject) => {
    $.post(taskUrl(function_id, body), (err, resp, data) => {
      try {
        if (err) {
          console.log('\n东东萌宠: API查询请求失败 ‼️‼️');
          console.log(JSON.stringify(err));
          $.logErr(err);
        } else {
          data = JSON.parse(data);
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data)
      }
    })
  })
}
// function taskUrl(function_id, body = {}) {
//   return {
//     url: `${JD_API_HOST}?functionId=${function_id}&appid=wh5&loginWQBiz=pet-town&body=${escape(JSON.stringify(body))}`,
//     headers: {
//       Cookie: cookie,
//       UserAgent: $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
//     }
//   };
// }
function taskUrl(function_id, body = {}) {
  body["version"] = 2;
  body["channel"] = 'app';
  return {
    url: `${JD_API_HOST}?functionId=${function_id}`,
    body: `body=${escape(JSON.stringify(body))}&appid=wh5&loginWQBiz=pet-town&clientVersion=9.0.4`,
    headers: {
      'Cookie': cookie,
      'User-Agent': $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
      'Host': 'api.m.jd.com',
      'Content-Type': 'application/x-www-form-urlencoded',
    }
  };
}
function jsonParse(str) {
  if (typeof str == "string") {
    try {
      return JSON.parse(str);
    } catch (e) {
      console.log(e);
      $.msg($.name, '', '请勿随意在BoxJs输入框修改内容\n建议通过脚本去获取cookie')
      return [];
    }
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
