FROM node:18-alpine

WORKDIR /app

# Copia package.json e package-lock
COPY package*.json ./

RUN npm install

COPY . .

EXPOSE ${PORT}

CMD ["npm", "run"]
