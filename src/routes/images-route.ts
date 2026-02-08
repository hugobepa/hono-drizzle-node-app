import { Hono } from "hono";
import { imagesTable } from "../db/schema.js";
import { db } from "../db/index.js";
import { eq, getTableColumns } from "drizzle-orm";

// create images route
const imagesRoute = new Hono();

imagesRoute.get("/", (c) => {
  return c.text("Hello from images route!");
});

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

// get all image metadata
imagesRoute.get("/metadata", async (c) => {
  const { id, name, type, size } = getTableColumns(imagesTable);
  const images = await db.select({ id, name, type, size }).from(imagesTable);
  return c.json({ images });
});

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

// export users route
export default imagesRoute;
