# Folosim Node 20 (LTS) pentru stabilitate cu React 19/Next 16
# alpine este o versiune foarte mică și rapidă de Linux
FROM node:20-alpine

# Setăm folderul de lucru în container
WORKDIR /app

# Copiem fișierele de dependențe
# Copiem și package-lock.json pentru a păstra versiunile exacte ale librăriilor
COPY package*.json ./

# Instalăm dependențele
# Folosim --frozen-lockfile dacă ai avea pnpm/yarn, dar pentru npm e standard install
RUN npm install

# Copiem restul codului sursă din folderul src în container
COPY . .

# Construim aplicația pentru producție (Next.js build)
RUN npm run build

# Expunem portul 3000 (portul default Next.js)
EXPOSE 3000

# Comanda care pornește aplicația
CMD ["npm", "run", "start"]