import flask
from urllib3 import disable_warnings

disable_warnings()
server = flask.Flask(__name__)


@server.route('/genToken', methods=['post'])
def main():
    return "have a fun!"


if __name__ == '__main__':
    server.run(host='0.0.0.0', port=9000, debug=True)
