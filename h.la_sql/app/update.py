import requests
import os
import hashlib

branch = "create-pull-request/patch"

def split(str):
    return list(filter(None, str.split("\n")))


def save(path, data):
    f = open(path, 'wb')
    f.write(data)
    f.close()


def download(file):
    res = requests.get(
        f"https://raw.githubusercontent.com/2dongsik2/hitomi-mirror-korea-3/{branch}/segments/{file}")
    save(f"segments/{file}", res.content)


def sha1(filepath, blocksize=8192):
    sha_1 = hashlib.sha1()
    try:
        f = open(filepath, "rb")
    except IOError as e:
        print("file open error", e)
        return
    while True:
        buf = f.read(blocksize)
        if not buf:
            break
        sha_1.update(buf)
    return sha_1.hexdigest()


res = requests.get(
    f"https://raw.githubusercontent.com/2dongsik2/hitomi-mirror-korea-3/{branch}/segments/sha1sum")
# print("get hashes from below link")
# print(f"https://raw.githubusercontent.com/2dongsik2/hitomi-mirror-korea-3/{branch}/segments/sha1sum")
segs = split(res.content.decode())
# print(segs)
for seg in segs:
    splits = seg.split("  ")
    fhash = splits[0]
    fname = splits[1]
    if (not os.path.exists(f"segments/{fname}")) or (fhash != sha1(f"segments/{fname}")):
        print(f"{fname} is not latest version, update...")
        download(fname)
    # print(fhash, sha1(f"segments/{fname}"), fname)