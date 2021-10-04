import json
import os
import sys
import sqlite3

db_filename = 'data.db'
schema_filename = 'data_schema.sql'
files_db_filename = 'files.db'
files_schema_filename = 'files_schema.sql'

db_is_new = not os.path.exists(db_filename)
files_db_is_new = not os.path.exists(files_db_filename)

conn = sqlite3.connect(db_filename)
files_conn = sqlite3.connect(files_db_filename)

logs = ""

if db_is_new:
    with open(schema_filename, 'rt') as f:
        schema = f.read()
    conn.executescript(schema)
if files_db_is_new:
    with open(files_schema_filename, 'rt') as f:
        schema = f.read()
    files_conn.executescript(schema)

# with open("data.json", "rt", encoding='utf-8') as file:
#   print(str(file.read().encode("utf8")[:100]))

if not os.path.exists("data.json"):
    sys.exit()
if not os.path.exists("tags.json"):
    sys.exit()
if not os.path.exists("files.json"):
    sys.exit()

data = json.load(open("data.json", encoding='utf-8'))
tags = json.load(open("tags.json"))
files = json.load(open("files.json"))

for item in data:
    try:
        conn.execute("""
  INSERT INTO galleries (id, type, title, artist, language, language_localname, japanese_title, date, tag_ids, file_ids)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  """, (item["id"],
            item["type"],
            item["title"],
            item["artist"],
            item["language"],
            item["language_localname"],
            item["japanese_title"],
            item["date"],
            item["tag_ids"],
            item["file_ids"])
        )
    except:
        pass
for item in tags:
    try:
        conn.execute("""
    INSERT INTO tags (full, type, name)
    VALUES (?, ?, ?)
    """, (item["full"],
            item["type"],
            item["name"])
        )
    except:
        pass
conn.commit()

for item in files:
    try:
        files_conn.execute("""
        INSERT INTO files (hash, hasavif, haswebp, width, height, name)
        VALUES (?, ?, ?, ?, ?, ?)
        """, (item["hash"],
              item["hasavif"],
              item["haswebp"],
              item["width"],
              item["height"],
              item["name"])
        )
    except:
        pass
files_conn.commit()
