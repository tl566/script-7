/**
 * JD双11赚汪汪币
 * 
 * Author: czj
 * Date: 2021/10/20
 * Time: 23:02:50
 * Versions: 1.1.0
 * Github: https://github.com/czj2369/jd_tb_auto
 */

// 需要完成的任务列表
var TASK_LIST = ["浏览并关注", "浏览8s", "累计浏览", "参与城城", "浏览可得", "去首页浮层进入"];

// 判断停留时间
var JUDGE_TIME = 0;
// 定时器
var interval;
// 已完成序号
var finished_task_num = new Array();
// 当前序号
var current_task_num = 0;
// 浏览就返回标记
var isBackFlag = false;
var huodong_indexInParent_num = 9;

init();

function init() {
    start();

    // 子线程开启计时
    threads.start(function () {
        if (interval == null) {
            // 开启计时器，进行卡顿计时
            // 启动定时器前，将计数器归为0
            JUDGE_TIME = 0;
            log("开启定时器");
            interval = setInterval(function () {
                JUDGE_TIME = JUDGE_TIME + 1;
            }, 1000);
        }
    });

    while (true) {
        enterActivity();

        recoverApp();

        var flag = getNeedSelector();

        viewTask(flag);

        addMarketCar();


    }


}

// 启动京东
function start() {
    auto.waitFor()
    var appName = "com.jingdong.app.mall";
    if (launch(appName)) {
        console.info("启动京东APP");
    }
    console.show();
}

// 进入做任务界面
function enterActivity() {
    if (!text("累计任务奖励").exists()) {
        sleep(4000);
        while (true) {
            if (text("累计任务奖励").exists()) {
                console.info("已经在任务界面");
                sleep(1000);
                break;
            } else {
                if (desc("浮层活动").exists()) {
                    console.info("点击浮层活动");
                    var huodong = desc("浮层活动").findOne().bounds();
                    randomClick(huodong.centerX(), huodong.centerY());
                    sleep(1000);
                    break;
                }

                // 获取进入做任务界面的控件
                var button = className('android.view.View')
                    .depth(14)
                    .indexInParent(huodong_indexInParent_num)
                    .drawingOrder(0)
                    .clickable();
                if (button.exists()) {
                    console.info("点击进入做任务界面")
                    var rect = button.findOne().bounds();
                    randomClick(rect.centerX(), rect.centerY());
                    sleep(1000);
                    break;
                } else {
                    huodong_indexInParent_num = huodong_indexInParent_num + 1;
                    if (huodong_indexInParent_num == 16) {
                        console.info("无法自动进入做任务界面，请手动进入！");
                        break;
                    }
                }
            }
            sleep(1000);
        }
    }
}

// 去完成任务
function viewTask(flag) {
    // 根据坐标点击任务，判断哪些需要进行
    sleep(2000);
    while (true && flag) {
        if ((textStartsWith("获得").exists() && textEndsWith("汪汪币").exists()) || text("已浏览").exists()) {
            console.info("任务完成，返回");
            viewAndFollow();
            // 重置计时
            JUDGE_TIME = 0;
            break;
        } else if (text("任务已达上限").exists()) {
            console.info("任务已达上限,切换已完成按钮");
            // 将当前任务序号添加到列表中，防止后续点到
            finished_task_num[finished_task_num.length] = current_task_num;
            viewAndFollow();
            // 重置计时
            JUDGE_TIME = 0;
            break;
        } else if (textContains('会员授权协议').exists()) {
            console.info("不授权加入会员，切换已完成按钮");
            // 将当前任务序号添加到列表中，防止后续点到
            finished_task_num[finished_task_num.length] = current_task_num;
            viewAndFollow();
            // 重置计时
            JUDGE_TIME = 0;
            break;
        } else if (textContains('当前页点击浏览5个').exists() || textContains('当前页浏览加购').exists()) {
            console.info("当前为加入购物车任务");
            // 重置计时
            JUDGE_TIME = 0;
            break;
        } else if (text("互动种草城").exists()) {
            console.info("当前为互动种草城任务");
            // 重置计时
            JUDGE_TIME = 0;
            if (interactionGrassPlanting()) {
                break;
            }
            break;
        } else if (text("到底了，没有更多了～").exists() && !text("消息").exists() && !text("扫啊扫").exists()
            && !(textStartsWith("当前进度").exists() && textEndsWith("10").exists())) {
            console.info("到底了，没有更多了～");
            // 重置计时
            JUDGE_TIME = 0;
            var count = 0;
            var button = className('android.view.View')
                .depth(19)
                .indexInParent(32)
                .drawingOrder(0)
                .clickable();
            while (true && button.exists()) {
                if (button.findOne().click()) {
                    sleep(2000);
                    console.info("浏览任务，点击返回");
                    if (text("消息").exists() && text("扫啊扫").exists()) {
                        break;
                    }
                    count = count + 1;
                    if (5 <= count) {
                        swipe(807, 314, 807, 414, 1);
                        sleep(1000);
                    }
                } else {
                    break;
                }
            }
            break;
        } else if (text("消息").exists() && text("扫啊扫").exists()) {
            console.warn("因为某些原因回到首页，重新进入活动界面");
            enterActivity();
        } else if (text("天天都能领").exists()) {
            sleep(2000);
            console.info("天天都能领");
            // 重置计时
            JUDGE_TIME = 0;
            var button = className('android.view.View')
                .depth(16)
                .indexInParent(3)
                .drawingOrder(0)
                .clickable().findOne().bounds();
            if (randomClick(button.centerX(), button.centerY())) {
                sleep(1000);
                console.log("点我收下");
                if (back()) {
                    break;
                }
            }
        } else if (text("邀请新朋友 更快赚现金").exists()) {
            sleep(2000);
            console.info("邀请新朋友");
            // 重置计时
            JUDGE_TIME = 0;
            var buttonList = className('android.view.View')
                .depth(16)
                .indexInParent(2)
                .drawingOrder(0)
                .clickable().find();
            var button;
            for (let index = 0; index < buttonList.length; index++) {
                if (buttonList[index].bounds().centerY() < 400) {
                    button = buttonList[index];
                }
            }
            if (randomClick(button.bounds().centerX(), button.bounds().centerY())) {
                console.info("点击取消");
                var buttonList2 = className('android.view.View')
                    .depth(16)
                    .indexInParent(1)
                    .drawingOrder(0)
                    .clickable().find();
                var button2;
                for (let index = 0; index < buttonList2.length; index++) {
                    if (buttonList2[index].bounds().centerY() > 1400) {
                        button2 = buttonList2[index];
                    }
                }
                if (randomClick(button2.bounds().centerX(), button2.bounds().centerY())) {
                    sleep(2000);
                    console.log("点我收下");
                    if (back()) {
                        break;
                    }
                }
            }
            break;
        } else if (text('京东11.11热爱环...').exists()) {
            console.info("下单任务，跳过");
            back();
        } else if (isBackFlag) {
            console.info("进入浏览就返回任务");
            sleep(2000);
            viewAndFollow();
            isBackFlag = false;
            break;
        } else {
            if (recoverApp()) {
                break;
            }
        }
    }

}

// 加入购物车
function addMarketCar() {
    if (textContains('当前页点击浏览5个').exists() || textContains('当前页浏览加购').exists()) {
        const productList = className('android.view.View').indexInParent(5).clickable().find();
        //const productList = className('android.widget.Button').depth(19).clickable().find()
        var count = 0;
        for (index = 0; index < productList.length; index++) {
            if (count == 5) {
                if (back()) {
                    sleep(1000)
                    count = 0;
                    break;
                }
            }
            if (productList[index].click()) {
                log("加入购物车任务:正在添加第" + (index + 1) + "个商品");
                sleep(2000);
                if (back()) {
                    count = count + 1;
                    sleep(2000);
                }
            }
        }
    }

}

// 互动种草城
function interactionGrassPlanting() {
    var count = 0;
    while (true) {
        if (randomClick(850, 430)) {
            console.info("去逛逛");
            sleep(2000);
            if (back()) {
                sleep(2000);
                count = count + 1;
                if (count == 5) {
                    return true;
                }
            }
        }
    }

}

// 获取需要进行的控件
function getNeedSelector() {
    var allSelector = className('android.view.View')
        .depth(19)
        .indexInParent(3)
        .drawingOrder(0)
        .clickable()
        .find();

    for (let index = 0; index < allSelector.length; index++) {
        for (var i = 0; i < TASK_LIST.length; i++) {
            // 获取具有需要完成任务字符串的控件集合
            var list = allSelector[index].parent().findByText(TASK_LIST[i]);
            // 如果长度大于0则表示存在该控件
            if (list.size() > 0) {
                // 获取不在序列中的序号
                if (finished_task_num.indexOf(index) < 0) {
                    console.info("当前已完成序列：", finished_task_num)
                    current_task_num = index;
                } else {
                    continue;
                }

                // 如果是浏览就返回的任务，将标记设为true
                isBackFlag = (TASK_LIST[i].indexOf("浏览可得") >= 0 || TASK_LIST[i].indexOf("浏览并关注可得2000") >= 0) ? true : false;

                var rect = allSelector[current_task_num].bounds();
                if (text("累计任务奖励").exists()) {
                    console.info("去完成任务，当前任务序列：", current_task_num)
                    randomClick(rect.centerX(), rect.centerY());
                    //console.info("开始任务:", allSelector[current_task_num].parent().findByText(TASK_LIST[i]).get(0).text());
                    return true;
                }
            }
        }
    }
}

// 返回
function viewAndFollow() {
    sleep(1000);
    back();
    sleep(1000);
}

// 自动判断程序是否卡顿，恢复方法
// 判断依据：1.不在活动界面 2.停留某个界面长达30s
function recoverApp() {
    if (!text("累计任务奖励").exists() && JUDGE_TIME > 30) {
        if (back()) {
            // 计时器重置
            JUDGE_TIME = 0;
            console.warn("停留某个页面超过30s,自动返回，重置定时器。");
            return true;
        }
    }else{
        return false;
    }
}

/**
 * 点击
 * @param {横坐标} x 
 * @param {纵坐标} y 
 */
function randomClick(x, y) {
    var rx = random(0, 5);
    var ry = random(0, 5);

    click(x + rx, y + ry);
    return true;
}

/**
 * Author: czj
 * Date: 2021/10/20
 * Time: 23:02:50
 * Github: https://github.com/czj2369/jd_tb_auto
 */