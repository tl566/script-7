const superagent = require("../config/superagent");
const cheerio = require("cheerio");
const request = require("request");
const axios = require("axios");
const ONE = "http://wufazhuce.com/"; // ONE的web版网站
// const POISON = "https://8zt.cc/"; //毒鸡汤网站
const POISON = "http://v1.alapi.cn/api/soul"; //毒鸡汤网站
const LOVE = "https://chp.shadiao.app/api.php"; //情话网站
const TXHOST = "https://api.tianapi.com/txapi/"; // 天行host 官网：tianapi.com
const APIKEY = "c8dd101b9e4087bd73e3cb0d2f2026a1"; // 天行key，请先去网站注册填写key  注册免费  注册后申请下面的接口即可。

const MYLINK = "https://api.m.jd.com/api";
// 妹子图
const MM = "https://www.mm618.com/"
/**
 * 获取每日一句
 */
async function getOne() {
  try {
    let res = await superagent.req(ONE, "GET");
    let $ = cheerio.load(res.text);
    let todayOneList = $("#carousel-one .carousel-inner .item");
    let todayOne = $(todayOneList[0])
      .find(".fp-one-cita")
      .text()
      .replace(/(^\s*)|(\s*$)/g, "");
    return todayOne;
  } catch (err) {
    console.log("错误", err);
    return err;
  }
}

// 获取妹子图
async function getGirl() {
  let ramdom = Math.floor(Math.random() * 20)
  let res = await superagent.req(MM, "GET");
  let $ = cheerio.load(res.text);
  let todayMmList = $(".excerpts-wrapper .excerpts .excerpt-c5");
  let todayMm = $(todayMmList[ramdom])
    .find(".thumb")
    .attr("data-src")
  return todayMm;
}


/**
 * 获取每日毒鸡汤
 */
async function getSoup() {
  try {
    // let res = await superagent.req(POISON, "GET");
    let res = await superagent.req(POISON, "GET");
    // let $ = cheerio.load(res.text);
    // const content = $("#sentence").text();
    const result = res.body;
    // return content;
    return result.data.title;
  } catch (err) {
    console.error("err");
    return err;
  }
}

/**
 *
 * 获取每日情话
 */
async function getSweet() {
  try {
    let res = await superagent.req(LOVE, "GET");
    const result = res.text;
    return result;
  } catch (err) {
    console.error("err");
    return err;
  }
}

/**
 * 获取全国肺炎数据
 */
function getChinaFeiyan() {
  return new Promise((resolve, reject) => {
    request.get(
      {
        url: `https://c.m.163.com/ug/api/wuhan/app/data/list-total?t=${new Date().getTime()}`,
      },
      function (err, response) {
        if (err) {
          reject(err);
        }
        const res = JSON.parse(response.body);
        resolve(res);
      }
    );
  });
}
/**
 * 获取省份肺炎数据
 */
async function getProvinceFeiyan(name) {
  return new Promise((resolve, reject) => {
    request.get(
      {
        url: `https://gwpre.sina.cn/interface/fymap2020_data.json?t=${new Date().getTime()}`,
      },
      function (err, response) {
        if (err) {
          reject(err);
        }
        try {
          const res = JSON.parse(response.body);
          res.data.list.forEach((item) => {
            if (name === item.name) {
              resolve(item);
              return;
            }
          });
        } catch (error) {
          reject(err);
        }
      }
    );
  });
}
/**
 * 获取神回复
 */
async function getGodReply() {
  const url = TXHOST + "godreply/index";
  try {
    let res = await superagent.req(url, "GET", {
      key: APIKEY,
    });
    let content = JSON.parse(res.text);
    if (content.code === 200) {
      return content.newslist[0];
    } else {
      console.log("获取接口失败", content.msg);
    }
  } catch (err) {
    console.log("获取接口失败", err);
  }
}
/**
 * 每日英语一句话
 */
async function getEnglishOne() {
  const url = TXHOST + "ensentence/index";
  try {
    let res = await superagent.req(url, "GET", {
      key: APIKEY,
    });
    let content = JSON.parse(res.text);
    if (content.code === 200) {
      return content.newslist[0]; //en英文  zh中文
    } else {
      console.log("获取接口失败", content.msg);
    }
  } catch (err) {
    console.log("获取接口失败", err);
  }
}

// 转链接
async function MyLink(params) {
  // var reg = /(https?|http|ftp|file):\/\/[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]/g;
  // let reg = /https:\/\/u\.jd\.com\/[A-Za-z0-9]*/g // 匹配的是无query参数的
  let reg = /https:\/\/u\.jd\.com\/[A-Za-z0-9]*\??([A-Za-z0-9]*=[A-Za-z0-9]*&*)*/g // 匹配有query参数的
  let arr = params.match(reg)
  console.log(arr, "原始链接");
  let tempLink = []

  if (arr && arr.length) {
    for (let i = 0; i < arr.length; i++) {
      tempLink.push(
        new Promise(async (resolve, reject) => {
          let res = await axios.get(MYLINK, {
            params: {
              functionId: "ConvertSuperLink",
              appid: "u",
              _: new Date().getTime(),
              body: {
                funName: "getSuperClickUrl",
                param: { materialInfo: arr[i], ext1: "200|100_3|" },
                unionId: 2014279345,
              },
              loginType: 2,
            },
            withCredentials: true,
            headers: {
              Cookie: 'pt_pin=jd_40f0d4d9188e0;pt_key=AAJgoiLaADCAnfjLmk0ADAPhPtzDRZSjhvjc7AeI5w-ilZACIhCAhPIe3ohUdP8WvUshG26IU24'
            }
          })
          if (res.data.code === 200) {
            resolve(res.data.data.promotionUrl || res.data.data.originalContext || '')
          }
        })
      )
    }
    let res = await Promise.all(tempLink)
    console.log(res, "我需要的链接");
    arr.forEach((item, idx) => {
      params = params.replace(item, res[idx] ? res[idx] : item)
    })
    console.log(params, "我的推广文案");
    return params
  } else {
    if (params.includes('毒鸡汤')) {
      params = ""
    } else {
      params = params
    }
    return params
  }
}

module.exports = {
  getOne,
  getGirl,
  getSoup,
  getSweet,
  getChinaFeiyan,
  getProvinceFeiyan,
  getGodReply,
  getEnglishOne,
  MyLink,
};