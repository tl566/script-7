import flask
from urllib3 import disable_warnings
from flask import request
from uuid import uuid4
from urllib.parse import quote
from json import dumps

disable_warnings()
server = flask.Flask(__name__)


def get_sign(functionId, body, uuid, client, clientVersion):
    sign = functionId + body + uuid + client + clientVersion
    return sign


@server.route('/genToken', methods=['post'])
def main():
    url = request.values.get('url')
    if url:
        body = '{"to":"%s"}' % url
        sign = get_sign("genToken", body, "".join(str(uuid4()).split("-")), "apple", "10.0.10")
        res = {"code": 200, "data": {"body": f'body={quote(body)}', "sign": sign}}
    else:
        res = {"code": 400, "data": "请传入url参数！"}
    if url:
        print(res)
        return dumps(res, ensure_ascii=False)


if __name__ == '__main__':
    server.run(host='0.0.0.0', port=9000, debug=True)
