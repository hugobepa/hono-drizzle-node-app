import { Hono } from "hono";

// create images route
const imagesRoute = new Hono();

imagesRoute.get("/", (c) => {
  return c.text("Hello from images route!");
});

imagesRoute.post("/", async (c) => {
  const body = await c.req.parseBody();
  const files = body.image;
  console.log(files);
  return c.json({ message: "Hello from images file route!", files });
});

// export users route
export default imagesRoute;
