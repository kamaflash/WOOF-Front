# ---------- BUILD ----------
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci --legacy-peer-deps

COPY . .

# Build Angular
RUN npx ng build buddy-adopt --configuration production


# ---------- RUN ----------
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

# ⚠️ IMPORTANTE: solo browser
COPY --from=build /app/dist/buddy-adopt/browser /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
