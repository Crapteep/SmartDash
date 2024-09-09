
FROM node:20 AS build-stage

WORKDIR /app

COPY package*.json /app/

RUN npm install --legacy-peer-deps


COPY ./ /app/

ARG VITE_API_URL=${VITE_API_URL}

RUN npm run build


# Stage 1, based on Nginx, to have only the compiled app, ready for production with Nginx
FROM nginx:1

COPY --from=build-stage /app/dist/ /usr/share/nginx/html



# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]