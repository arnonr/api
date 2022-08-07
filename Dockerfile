# Engine
FROM node:16.15-alpine
ENV NODE_ENV=production
LABEL maintainer="KMUTNB"

RUN mkdir -p /app
# กำหนด working directory สำหรับการ run
WORKDIR /app
COPY package.json ./

# install dependencies
RUN npm install
RUN npm install -g nodemon

# copy file ทั้งหมด
COPY . .

# build production
# RUN npm run build


RUN chown -R node /app
USER node

# RUN chmod +x /usr/

CMD [ "npm","run","dev" ]

EXPOSE 80
