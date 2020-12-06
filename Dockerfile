FROM mongo:4

WORKDIR /usr/aplic

RUN apt update
RUN apt install -y curl

RUN curl -sL https://deb.nodesource.com/setup_14.x | bash -
RUN apt-get install -y nodejs

COPY mongo/package.json /usr/aplic/
RUN npm install

COPY mongo/app.js /usr/aplic/

ENTRYPOINT [ "npm", "start" ]