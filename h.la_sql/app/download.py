import requests
import os

list_url = "https://raw.githubusercontent.com/2dongsik2/hitomi-mirror-korea-3/main/segments/list"
checksum = "https://raw.githubusercontent.com/2dongsik2/hitomi-mirror-korea-3/main/segments/md5sum"


def split(str):
    return list(filter(None, str.split("\n")))


def save(path, data):
    f = open(path, 'wb')
    f.write(data)
    f.close()


if not os.path.exists("segments"):
    os.makedirs("segments")

with requests.get(list_url) as a:
    cfs = split(a.content.decode())
    save("segments/list", a.content)
    print(cfs)
    for cf in cfs:
        res = requests.get(
            f"https://raw.githubusercontent.com/2dongsik2/hitomi-mirror-korea-3/main/segments/{cf}.list")
        save(f"segments/{cf}.list", res.content)
        sgs = split(res.content.decode())
        print(sgs)
        for sg in sgs:
            print(sg)
            res = requests.get(
                f"https://raw.githubusercontent.com/2dongsik2/hitomi-mirror-korea-3/main/segments/{sg}")
            save(f"segments/{sg}", res.content)
