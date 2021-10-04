#!/bin/bash
DIR="segments"

if [ -d "$DIR" ]
then
	if [ "$(ls -A $DIR)" ]; then
        echo "=========update stage========="
		output=$(python update.py)
		if [ "$output" ]; then
			echo "$output"
			wget https://raw.githubusercontent.com/2dongsik2/hitomi-mirror-korea-3/create-pull-request/patch/latest.date -q -O latest.date
			echo "=========merge stage========="
			source merge.sh
			echo "=========remove database========="
			rm *.db
			echo "=========import stage========="
			python import.py
		fi
	else
		echo "=========download stage========="
        python download.py
		wget https://raw.githubusercontent.com/2dongsik2/hitomi-mirror-korea-3/create-pull-request/patch/latest.date -q -O latest.date
		echo "=========merge stage========="
		source merge.sh
		echo "=========import stage========="
		python import.py
	fi
else
	echo "Segments directory not found."
fi

if [ ! -f "data.db" ]; then
	echo "=========merge stage========="
	source merge.sh
	echo "=========import stage========="
	python import.py
fi

echo "=========server stage========="
node server.js
#python server.py
