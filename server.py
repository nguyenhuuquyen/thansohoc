from flask import Flask, request, Response, jsonify, send_from_directory
import urllib.request
import json
import os

app = Flask(__name__, static_folder='.', static_url_path='')

# Updated to Dify v1 base URL and chat-messages endpoint
API_ENDPOINT = 'http://43.133.4.161/v1/chat-messages'
API_KEY = 'app-qGAP78x7xEIS7n8XgxrP8973'
USER_ID = 'apple-001'


@app.after_request
def add_cors_headers(resp):
    resp.headers['Access-Control-Allow-Origin'] = '*'
    resp.headers['Access-control-Allow-Headers'] = 'Content-Type, Authorization'
    resp.headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS'
    return resp


@app.route('/')
def index():
    return send_from_directory('.', 'index.html')


@app.route('/api/numerology', methods=['POST', 'OPTIONS'])
def numerology():
    if request.method == 'OPTIONS':
        return Response(status=204)

    try:
        payload = request.get_json(force=True, silent=True) or {}
        rawtext = payload.get('rawtext', '')
        # Dify v1 chat-messages typical payload
        body = {
            'inputs': {
                'rawtext': rawtext
            },
            'query': 'extract',
            'user': USER_ID,
            'response_mode': 'blocking'
        }
        data = json.dumps(body).encode('utf-8')

        req = urllib.request.Request(API_ENDPOINT, data=data, method='POST')
        req.add_header('Content-Type', 'application/json')
        req.add_header('Authorization', f'Bearer {API_KEY}')

        with urllib.request.urlopen(req) as r:
            resp_body = r.read()
            content_type = r.headers.get('Content-Type', 'application/json')

        try:
            parsed = json.loads(resp_body.decode('utf-8'))
            return jsonify(parsed), 200
        except Exception:
            return Response(resp_body, status=200, content_type=content_type)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5051)