const notify = require('../sendNotify')
!(async () => {
 await notify.sendNotify(`推送通知测试`, `测试通知消息体啊`);
})()
    .catch((e) => {
      console.log('', `❌失败! 原因: ${e}!`, '')
    })