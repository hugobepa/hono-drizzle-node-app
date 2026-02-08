[Get Started Fast with Hono JS and Drizzle ORM 18m](https://www.youtube.com/watch?v=dWGsvnjcgCw)
[github](https://github.com/aaronksaunders/hono-drizzle-node-app-1)
[oficialDrizzleSQL](https://orm.drizzle.team/docs/sql)
[drizzleNode](https://hono.dev/docs/getting-started/nodejs)
[Migrations with Drizzle Kit](https://orm.drizzle.team/docs/kit-overview)
[ File Upload Using Hono JS and Drizzle ORM](https://www.youtube.com/watch?v=ZOtPrPi3FkA)

# Started Fast with Hono JS and Drizzle ORM

## creacion y config proyecto

0. create project,T: bun create hono@latest hono-drizzle-node-app
	- nodejs, Y
1. ir proyecto:  cd hono-drizzle-node-app
2. install paquets,T: bun add drizzle-orm better-sqlite3 dotenv
			- bun add -D drizzle-kit tsx  
			- bun add --save-dev @types/better-sqlite3    
3. create `.env`: `DATABASE_URL=./db.sqlite  SECRET_KEY=your_secret_key_here`	
4. 	create `src\db\index.ts`:	

````
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema.js";
import "dotenv/config";

// get database url from env, get database
const sqlite = new Database(process.env.DATABASE_URL ?? "sqlite.db");

// export db instance from drizzle
export const db = drizzle(sqlite, { schema });
````

5. create `src\db\schema.ts`:

````
import { sql } from "drizzle-orm";
import { int, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

// create users table
export const usersTable = sqliteTable(
  "users_table",
  {
    id: int().primaryKey({ autoIncrement: true }),
    name: text().notNull(),
    age: int().notNull(),
    email: text().notNull().unique(),
    createdAt: text()
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text()
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  // create unique index on email column
  (table) => [uniqueIndex("email_idx").on(table.email)]
);

// export types for users table
export type User = typeof usersTable.$inferSelect;
export type InsertUser = typeof usersTable.$inferInsert;
````

6. create `drizzle.config.ts`:

````
import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schema.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
````

7. add `package.json`: 

````
 "scripts": {
    ...
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate"
````

8. generar tabla,T: bun run db:generate
9. comprobaar migracion hecha `drizzle\0000_parallel_firestar.sql`
10. crear DB,T: bun run db:migrate
11. install kit and studio,T: bun add drizzle-kit studio
12. ir drizzle studio,T: bun run drizzle-kit studio -- web local: https://local.drizzle.studio
	- Connecting to the Drizzle Kit on localhost:4983
	- drizzle-kit studio
13. web local: https://local.drizzle.studio crear  2 row-- add record, save,  


## creacion rutas DB

0. create `src\routes\users-route.ts`:
	- creamos app: `const usersRoute = new Hono();`
	- creamos prueba: `usersRoute.get("/", (c) => { return c.text("Hello from users route!");});`
	- exportamos datos `export default usersRoute;`
````
import { Hono } from "hono";
import { db } from "../db/index.js";
import { usersTable } from "../db/schema.js";
import { eq } from "drizzle-orm";

// create users route
const usersRoute = new Hono();

usersRoute.get("/", (c) => {
  return c.text("Hello from users route!");
});

// export users route
export default usersRoute;


````

1. lo llamamos desde la principal `src\index.ts`:
	- importamos users: `import usersRoute from "./routes/users-route.js";`
	- utilizamos users. `app.route("/users", usersRoute);`

````
import usersRoute from "./routes/users-route.js";

const app = new Hono();
...
// add users route to app
const users = app.route("/users", usersRoute);
````	
2. comprobar connexion, thunder,get: http://localhost:3000/users	

3. add funcion obtener usuarios `src\routes\users-route.ts`:

````
import { db } from "../db/index.js";
import { usersTable } from "../db/schema.js";

//get all users
usersRoute.get("/", async (c) => {
  const users = await db.select().from(usersTable);
  return c.json(users);
});
````

4. comprobar usuarios, thunder,get: http://localhost:3000/users	

5.  add funcion crear usuarios `src\routes\users-route.ts`:

````
// create a new user
usersRoute.post("/", async (c) => {
  const { name, age, email } = await c.req.json();
  const newUser = await db.insert(usersTable).values({ name, age, email });
  return c.json(newUser);
});
````
6. creacion usuario , thunders, POST: http://localhost:3000/users
	- body -json -- { "name":"jeremy doe", "age": 60, "email": "jeremy.doe3@example.com"}
7. comprobar usuarios, thunder,get: http://localhost:3000/users

8. obtener users x ID `src\routes\users-route.ts`:

````
import { eq } from "drizzle-orm";

// get a user by id
usersRoute.get("/:id", async (c) => {
  const { id } = c.req.param();
  const user = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, Number(id)));
  return c.json(user);
});
````
9. comprobar usuarios x id, thunder,get: http://localhost:3000/users/1

10. cambiar usaurio y comprobarlo `src\routes\users-route.ts`:

````
// update a user by id
usersRoute.put("/:id", async (c) => {
  const { id } = c.req.param();
  const { name, age, email } = await c.req.json();
  const updatedUserResult = await db
    .update(usersTable)
    .set({ name, age, email })
    .where(eq(usersTable.id, Number(id)));

  // error if not found
  if (!updatedUserResult) {
    return c.json({ error: "User not found" }, 404);
  }

  // else get updated user
  const updatedUser = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, Number(id)));

  return c.json(updatedUser);
});
````
11. actualizar usuario , thunders, PUT: http://localhost:3000/users/1
	- cambiar nombre y mail: body -json -- { "name":"sharuman", "age": 60, "email": "sharuman@example.com"}

12. eliminar usuario `src\routes\users-route.ts`:

````
// delete a user by id
usersRoute.delete("/:id", async (c) => {
  const { id } = c.req.param();
  const deletedUser = await db
    .delete(usersTable)
    .where(eq(usersTable.id, Number(id)));
  return c.json(deletedUser);
});
````
13. comprobar eliminacion usuario, thunder,DElETE: http://localhost:3000/users/1
14. comprobar usuarios, thunder,get: http://localhost:3000/users
