- BUG漫天飞
- MAIKA永相随
***
#### 刚开始学习使用GITHUB，我是一个菜鸟
#### 同样的也是刚开始学习PYTHON
#### 尝试使用python写一个基于E大的dockerV3的机器人交互
***
> 主要实现功能：
>> /start 开始使用本程序
>>    /help 查看使用帮助
>>    /bash 执行bash程序，如git_pull、diy及可执行自定义.sh，例如/bash /jd/config/abcd.sh
>>    /node 执行js脚本文件，目前仅支持/scirpts、/config目录下js，直接输入/node jd_bean_change 即可进行执行。该命令会等待脚本执行完，期间不能使用机器人，建议使用snode命令。
>>    /cmd 执行cmd命令,例如/cmd python3 /python/bot.py 则将执行python目录下的bot.py
>>    /snode 命令可以选择脚本执行，只能选择/jd/scripts目录下的脚本，选择完后直接后台运行，不影响机器人响应其他命令
>>    /log 选择查看执行日志
>>    此外直接发送文件，将自动保存至/jd/scripts/或/jd/config目录下，如果是config.sh，crontab.list会覆盖原文件，crontab.list文件会自动更新时间;其他文件会被保存到/jd/scripts文件夹下
