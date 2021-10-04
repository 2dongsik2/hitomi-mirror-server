#!/bin/bash
echo "=========update stage========="
output=$(python update.py)
if [ "$output" ]; then
    echo "$output"
    wget https://raw.githubusercontent.com/2dongsik2/hitomi-mirror-korea-3/create-pull-request/patch/latest.date -q -O latest.date
fi
echo "=========merge stage========="
source merge.sh
echo "=========update database stage========="
python update_db.py