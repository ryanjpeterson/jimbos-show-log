# jimbos-show-log

This app requires an .env file in the root directory and backend directory with the following variables. Replace username, password, dbname, email, secret and email with real values.

In the backend directory, DATABASE_URL should be the Prisma connection string.

DATABASE_URL="postgresql://username:password@localhost:5432/dbname"
JWT_SECRET="secret"

DATABASE_USERNAME=username
DATABASE_PASSWORD=password
DATABASE_EMAIL=email

PORT=3000

POSTGRES_USER=username
POSTGRES_PASSWORD=password
POSTGRES_DB=dbname

ADMIN_USERNAME=username
ADMIN_EMAIL=email
ADMIN_PASSWORD=password