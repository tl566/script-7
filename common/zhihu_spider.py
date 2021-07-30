import time

import requests
from dao import zh_log_dao
from dao import zh_config_dao

headers1 = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36 QIHU 360SE'
}

headers2 = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1.1 Safari/605.1.15'
}


# 调知乎 api 查询文章基本信息
def get_question(qid):
    # 利用知乎 API 请求 json 数据
    # qid: 知乎问题号
    # offset: 第几页
    # 知乎 API
    url = "https://www.zhihu.com/api/v4/questions/{}?include=visit_count,answer_count".format(qid)
    try:
        res = requests.get(url, headers=headers1)
        res.encoding = 'utf-8'
    except BaseException as e:
        zh_log_dao.add_log(2, 'spider_zh_question_error', '[{}] {}'.format(url, e))
        return None, e

    time.sleep(1)  # 防止被风控

    json = res.json()

    if 'error' in json:
        error_code = json['error']['code']
        error_msg = json['error']['message']
        zh_log_dao.add_log(2, 'spider_zh_question_error', '[{}] [{}]{}'.format(url, error_code, error_msg))
        return None, '[{}]{}'.format(error_code, error_msg)

    return json, None


# 调知乎 api 查询文章的回答内容
def get_answer(qid, offset, with_content):
    # 利用知乎 API 请求 json 数据
    # qid: 知乎问题号
    # offset: 第几页
    # 知乎 API
    url = "https://www.zhihu.com/api/v4/questions/{}/answers?include=voteup_count&limit=20&offset={}&platform=desktop&sort_by=default".format(qid, offset)

    if with_content:
        url = "https://www.zhihu.com/api/v4/questions/{}/answers?include=content,voteup_count&limit=20&offset={}&platform=desktop&sort_by=default".format(qid, offset)

    try:
        res = requests.get(url, headers=headers2)
        res.encoding = 'utf-8'
    except BaseException as e:
        zh_log_dao.add_log(2, 'spider_zh_answer_error', '[{}] {}'.format(url, e))
        return None, e

    time.sleep(1)  # 防止被风控

    json = res.json()

    if 'error' in json:
        error_code = json['error']['code']
        error_msg = json['error']['message']
        zh_log_dao.add_log(2, 'spider_zh_answer_error', '[{}] [{}]{}'.format(url, error_code, error_msg))
        return None, '[{}]{}'.format(error_code, error_msg)

    return json, None


# 调知乎 api 查询文章的回答内容
def get_search_result(keyword, x_zse_86, cookie):
    # 知乎 API
    url = "https://www.zhihu.com/api/v4/search_v3?t=general&q={}&correction=1&offset=0&limit=20&lc_idx=0&show_all_topics=0".format(keyword)
    header = {
        "pragma": "no-cache",
        "cache-control": "no-cache",
        "x-zse-86": x_zse_86,
        "x-zse-83": "3_2.0",
        "referer": "https://www.zhihu.com/search?type=content&q={}".format(keyword),
        "cookie": cookie,
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36'
    }

    try:
        res = requests.get(url, headers=header)
        res.encoding = 'utf-8'
    except BaseException as e:
        zh_log_dao.add_log(2, 'spider_zh_search_error', '[{}] {}'.format(url, e))
        return None, e

    time.sleep(1)  # 防止被风控

    json = res.json()

    if 'error' in json:
        error_code = json['error']['code']
        error_msg = json['error']['message']
        zh_log_dao.add_log(2, 'spider_zh_search_error', '[{}] [{}]{}'.format(url, error_code, error_msg))
        return None, '[{}]{}'.format(error_code, error_msg)

    return json, None


# 查询文章的浏览量和回答数
def get_view_and_answer_num(qid):
    # 查询文章基本信息
    data, error_info = get_question(qid)
    if error_info is not None:
        return None, None, None

    return data['title'], data['visit_count'], data['answer_count']


# 获取自己的回答在问题中的排名和赞数
def get_rank_and_like(qid, aid):
    offset = 0
    rank = 0
    while True:
        qid = qid
        # 查询文章的回答内容
        data, error_info = get_answer(qid, offset, False)
        if error_info is not None:
            return None, None

        if len(data['data']) == 0:
            return offset, "-1"
        if offset > 100:
            return "100+", "-1"

        # 找对应答案的排名
        for item in data["data"]:
            rank += 1
            answer_id = item["id"]
            voteup_count = item['voteup_count']
            if str(answer_id) == aid or answer_id == aid:
                return rank, voteup_count

        offset += 20


# 调知乎 api 查询账户今日佣金
def get_zhihu_earnings(start, end, cookie):
    # 知乎 API
    url = "https://www.zhihu.com/api/v4/mcn/order_stats?begin_date={}&end_date={}".format(start, end)
    header = {
        "cookie": cookie,
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36'
    }

    try:
        res = requests.get(url, headers=header)
        res.encoding = 'utf-8'
    except BaseException:
        return "接口异常"

    json = res.json()

    return json['order_count'], json['estimate_income']


# 调京粉 api 查询账户今日佣金
def get_jingfen_earnings(start, end, cookie):
    # 知乎 API
    url = '''
        https://api.m.jd.com/api?appid=unionpc&body=%7B%22funName%22:%22querySpreadEffectData%22,%22param%22:%7B%22startDate%22:%22{}%22,%22endDate%22:%22{}%22,%22mediaId%22:%22%22,%22proCont%22:%22%22,%22promotionId%22:%22%22,%22sourceEmt%22:%22%22,%22pageNo%22:1,%22pageSize%22:20%7D%7D&functionId=union_report&loginType=3
    '''.format(start, end)
    header = {
        'cookie': cookie,
        'referer': 'https://union.jd.com/report',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36'
    }

    try:
        res = requests.get(url, headers=header)
        res.encoding = 'utf-8'
    except BaseException as e:
        return "接口异常"

    if 'login' in res.text:
        return 0, -10000

    json = res.json()

    return json['result']['spreadReportInfoChatList'][0]['orderNum'], json['result']['spreadReportInfoChatList'][0][
        'cosFee']



# 调知+ api 查询账户今日消耗
def get_zhijia_pay(start, end, cookie):
    # 知+ API
    url = '''
        https://xg.zhihu.com/api/v1/stat/overview?userId=39261&dataType=USER&groupUnit=BY_HOUR&stTms={}&endTms={}
    '''.format(start, end)
    header = {
        'cookie': cookie,
        'referer': 'https://xg.zhihu.com/advertiser/39261/home',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1.1 Safari/605.1.15'
    }

    try:
        res = requests.get(url, headers=header)
        res.encoding = 'utf-8'
    except BaseException as e:
        return "接口异常"

    json = res.json()

    return json['total']['cost']


if __name__ == "__main__":
    # print(get_question(37963557))

    # zhihu_cookie = jingfen_cookie = zh_config_dao.query_config('dxck').value

    # print(get_zhihu_earnings('2021-07-23', '2021-07-23', zhihu_cookie))

    # jingfen_cookie = zh_config_dao.query_config('jfck').value

    zhijia_cookie = zh_config_dao.query_config('zjck').value

    # print(zhijia_cookie)

    print(get_zhijia_pay('2021-07-29', '2021-07-29', zhijia_cookie))
