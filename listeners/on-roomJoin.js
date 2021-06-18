// async function onRoomJoin(room, inviteeList, inviter) {
//     const nameList = inviteeList.map(c => c.name()).join(',')
//     // console.log(`Room ${await room.topic()} got new member ${nameList}, invited by ${inviter}`)
//     // 如果机器人被拉到一个新的群组里, inviteeList[0] === bot.self()

//     room.topic().then(res => {
//         if (res === "自营京东省钱群") {
//             room.say(`欢迎 @${nameList} 加入群聊
// -----------------------
// 本群为京东自营商品***漏洞***微信群。
// 每天不定时分享各种神券、优惠券。平均价格低于市面上商家35%左右。
// 等你来淘~
// 温馨提示：建议将群信息设置为免打扰模式，以防打扰~
// -----------------------
// PS1:可无限邀请好友进群，@我获取1元红包噢~
// PS2:对我说菜单就可以唤醒我~
// PS3:快乐摸鱼群已上线，欢迎大家一起摸鱼学习
// 邀请人 @${inviter.name()}`)
//         }
//     }).catch(err => {
//         console.log(err);
//     })
// }

// module.exports = onRoomJoin

async function onRoomJoin(room, inviteeList, inviter) {
    const nameList = inviteeList.map(c => c.name()).join(',')
    // console.log(`Room ${await room.topic()} got new member ${nameList}, invited by ${inviter}`)
    // 如果机器人被拉到一个新的群组里, inviteeList[0] === bot.self()

    let emmm = await room.topic()
    if (emmm != "自营京东省钱群") return
    room.say(`欢迎 @${nameList} 加入群聊
-----------------------
本群为京东自营商品  漏洞  微信群。
每天不定时分享各家店铺优惠券。平均价格低于市面上商家35%左右。
等你来淘~
温馨提示：建议将群信息设置为免打扰模式，以防打扰~
-----------------------
PS1:可无限邀请好友进群，@我获取1元红包噢~
PS2:对我说菜单就可以唤醒我~
PS3:快乐摸鱼群已上线，欢迎大家一起摸鱼学习
邀请人 @${inviter.name()}`)
}

module.exports = onRoomJoin