[ File Upload Using Hono JS and Drizzle ORM 20m](https://www.youtube.com/watch?v=ZOtPrPi3FkA)
[github](https://github.com/aaronksaunders/hono-drizzle-node-app-1/tree/2-add-file-upload)
[blogDoc](https://dev.to/aaronksaunders/quick-rest-api-file-upload-with-hono-js-and-drizzle-49ok)
[oficialDrizzleSQL](https://orm.drizzle.team/docs/sql)
[honoFileUpload](https://hono.dev/examples/file-upload)
[Migrations with Drizzle Kit](https://orm.drizzle.team/docs/kit-overview)


# File Upload Using Hono JS and Drizzle ORM

## creacion y config proyecto
0. creamos rura de imagens `src\routes\images-route.ts`:
  
  ````
import { Hono } from "hono";

// create images route
const imagesRoute = new Hono();

imagesRoute.get("/", (c) => {
  return c.text("Hello from images route!");
});

// export users route
export default imagesRoute;

  ````
2. añadimos ruta `src\index.ts`:

````
import { Hono } from "hono";
import imagesRoute from "./routes/images-route.js";
const app = new Hono();
....

// add images route to app
const images = app.route("/images", imagesRoute);
````
3. subir servidor,T: bun run dev
3. comprobar ruta,web: http://localhost:3000/images

4. añadimos subir imagen `src\routes\images-route.ts`:

````
imagesRoute.post("/", async (c) => {
  const body = await c.req.parseBody();
  const files = body.image;
  console.log(files);
  return c.json({message: "Hello from images file route!",files})
  
  })
````

5. añadimos imagen al root de proyecto para probarla `super.jpeg`
6. abrimos otra terminal desde VS y trabjamos en ella:
	- enter
	- password vacio y enter
	- pasamos de los errore comentados pero que salga `HTTP/1.1 200 OK`
````
curl -X POST \ http://localhost:3000/images \ -H "Content-Type: multipart/form-data" \ -F "image=@./super.jpeg" {message: "Hello from images file route!"}
````
7. volvemos al Terminal principal y deneria aparacer esto:
````
File {
  size: 276323,
  type: 'image/jpeg',
  name: 'super.jpeg',
  lastModified: 1770551781398
}
````

## trabajamos con el fichero

0. añadimos subir imagen `src\routes\images-route.ts`:
	- lo convertimos en array `const fileArray = Array.isArray(files) ? files : [files];`
	- devolvemos informacion : ` fileArray.map(async (file) => {...})`
	- mostramos datos de fichero ` return c.json({..})`
````

imagesRoute.post("/", async (c) => {
  const body = await c.req.parseBody();
  const files = body.image;

// check if files is an array and has length
  if (!files || (Array.isArray(files) && files.length === 0)) {
    return c.json({ message: "No files uploaded" }, 400);
  }

  // if files is not an array, convert it to an array
  const fileArray = Array.isArray(files) ? files : [files];

  const processedImages = await Promise.all(
    fileArray.map(async (file) => {
      // load into a buffer for later use
      const buffer = Buffer.from(await file.arrayBuffer());
      return {
        name: file.name,
        type: file.type,
        size: file.size,
        //buffer,
      };
    }),
  );
  console.log("files", files, "processedImages", processedImages);
  return c.json({
    message: "Hello from images file route!",
    files: processedImages,
  });
});
````
1. abrimos 2ª terminal o de carga desde VS y trabjamos en ella:
	- enter
	- password vacio y enter
````
curl -X POST \ http://localhost:3000/images \ -H "Content-Type: multipart/form-data" \ -F "image=@./super.jpeg" {message: "Hello from images file route!"}
````
aparecera:
````
HTTP/1.1 200 OK
...

{"message":"Hello from images file route!","files":[{"name":"super.jpeg","type":"image/jpeg","size":276323}]}

````
2. terminal 1 o servidor `bun run dev` aparecera:

````
files File {
  size: 276323,
  type: 'image/jpeg',
  name: 'super.jpeg',
  lastModified: 1770559831004
} processedImages [ { name: 'super.jpeg', type: 'image/jpeg', size: 276323 } ]
````

## creamos tabla de imagen

0. creamos  plantilla de esquema imagen `src\db\schema.ts`:

````
import {...,blob,} from "drizzle-orm/sqlite-core";


////////////////////////////////////////////////////////////
// create images table
////////////////////////////////////////////////////////////
export const imagesTable = sqliteTable(
  "images_table",
  {
    id: int().primaryKey({ autoIncrement: true }),
    name: text().notNull(),
    type: text().notNull(),
    size: int().notNull(),
    image: blob().notNull(),
    createdAt: text()
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text()
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [uniqueIndex("name_idx").on(table.name)],
);

// export types for images table
export type Image = typeof imagesTable.$inferSelect;
export type InsertImage = typeof imagesTable.$inferInsert;
````

1. creamos 3ª terminl en VS para crear tabla en BD:
	- bun run db:generate
     `images_table 7 columns 1 indexes 0 fks  [✓] Your SQL migration file ➜ drizzle\0001_charming_jigsaw.sql`
	 - se creo en `drizzle\0001_charming_jigsaw.sql`
	- bun run db:migrate  `[✓] migrations applied successfully` ,`db.sqlite`
2. añadimos subir imagen `src\routes\images-route.ts`:
	- introducimos imagen en DB ` const imageResult = await db.insert(imagesTable).values({...});`
	- imagen vacia ` if (!imageResult || !imageResult.changes) {...}`
	- insertamos el id a la BD ` return {id: imageResult.lastInsertRowid,...}`
````
import { db } from "../db/index.js";
import { imagesTable, usersTable } from "../db/schema.js";

const processedImages = await Promise.all(
    fileArray.map(async (file) => {
	...

  // insert into database
      const imageResult = await db.insert(imagesTable).values({
        name: file.name,
        type: file.type,
        size: file.size,
        image: buffer,
      });

      if (!imageResult || !imageResult.changes) {
        return c.json({ message: "Failed to insert image into database" }, 500);
      }

      return {
        id: imageResult.lastInsertRowid,
		name: file.name,
        type: file.type,
        size: file.size,
		}
````
3. abrimos 2ª terminal o de carga desde VS y trabjamos en ella:
	- enter
	- password vacio y enter
````
curl -X POST \ http://localhost:3000/images \ -H "Content-Type: multipart/form-data" \ -F "image=@./super.jpeg" {message: "Hello from images file route!"}
````
aparecera:
````
HTTP/1.1 200 OK
...

{"message":"Hello from images file route!","files":[{"name":"super.jpeg","type":"image/jpeg","size":276323}]}

````

4. verificar en DB `db.sqlite` -- actualizar -- image table

## obtenemos imagen x id, eliminamos imagen por id, obtener todas las imagenes

0. obtener imagen por id `src\routes\images-route.ts`:

````
import { eq } from "drizzle-orm";

// get image metadata by id
imagesRoute.get("/:id/metadata", async (c) => {
  const { id } = c.req.param();
  if (!id) {
    return c.json({ message: "No id provided" }, 400);
  }
  const image = await db
    .select()
    .from(imagesTable)
    .where(eq(imagesTable.id, Number(id)));
  return c.json({
    image: {
      id: image[0].id,
      name: image[0].name,
      type: image[0].type,
      size: image[0].size,
    },
  });
});

````
1. comprobamos funcion, echoAPI GET: localhost:3000/images/1/metadata

2. eliminamos imagen x id  `src\routes\images-route.ts`:

````
//delete image by id
imagesRoute.delete("/:id", async (c) => {
  const { id } = c.req.param();
  if (!id) {
    return c.json({ message: "No id provided" }, 400);
  }
  const image = await db
    .delete(imagesTable)
    .where(eq(imagesTable.id, Number(id)));
  return c.json({ message: "Image deleted", image });
});
````
3. comprobamos funcion, echoAPI DELETE: localhost:3000/images/1

4. funcion ver todas imagenes  `src\routes\images-route.ts`:
	- comentamos mensaje hola
````
import { eq, getTableColumns } from "drizzle-orm";

// get all image metadata
imagesRoute.get("/metadata", async (c) => {
  const { id, name, type, size } = getTableColumns(imagesTable);
  const images = await db.select({ id, name, type, size }).from(imagesTable);
  return c.json({ images });
});
````
5. comprobamos, echoAPI,GET: localhost:3000/images/metadata

## download Image

0. funcion download todas imagenes  `src\routes\images-route.ts`:

````
// download image by id
imagesRoute.get("/:id/download", async (c) => {
  const { id } = c.req.param();
  if (!id) {
    return c.json({ message: "No id provided" }, 400);
  }
  const image = await db
    .select()
    .from(imagesTable)
    .where(eq(imagesTable.id, Number(id)));

  // set content type appropriately
  if (!image || image.length === 0) {
    return c.json({ message: "Image not found" }, 404);
  }
  // Convert Uint8Array to ArrayBuffer for proper response
  const imgData = image[0].image as Uint8Array;
  const arrayBuffer = imgData.buffer.slice(
    imgData.byteOffset,
    imgData.byteOffset + imgData.byteLength,
  ) as ArrayBuffer;
  return c.body(arrayBuffer, {
    headers: { "Content-Type": image[0].type },
    status: 200,
  });
});
````
1. comprobamos funcion, echoAPI GET: localhost:3000/images/2/download


