# Usa la imagen oficial de Node.js
FROM node:18

# Crea y establece el directorio de trabajo
WORKDIR /app

# Copia archivos necesarios
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Copia el resto del código
COPY . .

# Expone el puerto que usará Express
EXPOSE 8080

# Comando para correr tu servidor
CMD [ "node", "index.js" ]
