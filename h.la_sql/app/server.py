from flask import Flask  # 서버 구현을 위한 Flask 객체 import
from flask_restx import Api, Resource  # Api 구현을 위한 Api 객체 import
import sqlite3
import sys
import os

db_filename = 'data.db'
schema_filename = 'data_schema.sql'
files_db_filename = 'files.db'
files_schema_filename = 'files_schema.sql'

if (not os.path.exists(db_filename)) or (not os.path.exists(files_db_filename)):
    sys.exit()

conn = sqlite3.connect(db_filename)
files_conn = sqlite3.connect(files_db_filename)

app = Flask(__name__)  # Flask 객체 선언, 파라미터로 어플리케이션 패키지의 이름을 넣어줌.
api = Api(app)  # Flask 객체에 Api 객체 등록

def search_by_id():
    

@api.route('/hello')  # 데코레이터 이용, '/hello' 경로에 클래스 등록
class HelloWorld(Resource):
    def get(self):  # GET 요청시 리턴 값에 해당 하는 dict를 JSON 형태로 반환
        return {"hello": "world!"}


if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=4052)
