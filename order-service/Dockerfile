FROM node:14
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 4001

# Set environment variables for the database connection
ENV DATABASE_HOST=host.docker.internal
ENV DATABASE_PORT=5432
ENV DATABASE_ENGINE=postgres
ENV DATABASE_USERNAME=anhtran
ENV DATABASE_PASSWORD=_briantran2211
ENV DATABASE_NAME=saga-order

ENV TYPEORM_ENTITIES=/entities/**.entity{.ts,.js}
ENV TYPEORM_MIGRATIONS=src/migrations/migrations/*{.ts,.js}
ENV TYPEORM_MIGRATIONS_DIR=src/database/migrations
ENV TYPEORM_LOGGING=true
ENV TYPEORM_SYNCHRONIZE=true
ENV TYPEORM_MIGRATION_RUN=false

CMD ["npm", "run", "start:prod"]