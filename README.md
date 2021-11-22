# jd_scripts
京东活动脚本

## 注意事项
1. 店铺和商品关注收藏有上限，需要定期手动取消店铺和商品关注

## 脚本来源关注 2021年11月11日更新
https://github.com/shufflewzc/faker2
https://github.com/inoyna12/JDsc



## todolist
高价值（引入代理ip）
1. 京喜签到【完成】            -jx_sign.js
2. 京喜88红包【完成】          -jd_jxlhb.js
3. 东东农场水果【完成】        -jd_fruits.js
4. 种豆得豆【完成】            -jd_plantBean.js

中价值（京豆较少）
1. 多合一签到【完成】          -jd_bean_sign.js
2. 送豆得豆【完成】            -jd_sendBeans.js


低价值（无需变更和引入代理ip的）
1. 京东价保【完成】            -jd_price.js
2. 资产变动通知【完成】        -jd_bean_change.js
3. 获取互助码【完成】          -jd_get_share_code.js


超高价值个人专用版
1. 京东店铺锁y【完成】         -jd_jingfen.js
2. 删除过期ck【完成】          -jd_CheckCK.js



锁佣脚本1车在周一执行。2车在周二，以此类推，每周运行一次



### 新脚本增加代理ip设置
将env开头替换如下，即可以支持代理ip访问
```
const name = new Env('脚本名称');  // 拉取脚本时定时任务命名
const myEnv = require('./myEnv.js')
const $ = new myEnv.Env('京喜领88元红包');
```
