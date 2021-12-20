from requests import post

url = "https://service-7p46ib8s-1304375540.gz.apigw.tencentcs.com/release/genToken"
data = {"wskey": ""}
proxies = {"http": None, "https": None}
res = post(url, data=data, proxies=proxies)
print(res.text)
