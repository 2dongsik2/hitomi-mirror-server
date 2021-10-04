#FROM python:3
FROM nikolaik/python-nodejs:latest

WORKDIR /usr/src/app

COPY app/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY app/package.json ./
RUN npm install

COPY app/. .

CMD [ "./install.sh" ]