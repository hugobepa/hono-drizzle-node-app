import { Hono } from "hono";

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

// export users route
export default imagesRoute;
