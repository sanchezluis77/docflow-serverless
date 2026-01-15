# Usamos una imagen ligera de Node
FROM node:20-alpine

# Directorio de trabajo
WORKDIR /app

# Copiamos los archivos de dependencias primero (para aprovechar el caché de Docker)
COPY package.json package-lock.json ./

# Instalamos dependencias
RUN npm install

# Copiamos el resto del código
COPY . .

# Exponemos el puerto de Vite
EXPOSE 5173

# Comando de inicio (con --host para que sea accesible desde fuera del contenedor)
CMD ["npm", "run", "dev", "--", "--host"]