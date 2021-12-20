from requests import post

url = "https://service-fp8rk7fs-1304375540.gz.apigw.tencentcs.com/release/genToken"
data = {"wskey": ""}
res = post(url, data=data)
print(res.text)
