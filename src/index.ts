import { serve } from "@hono/node-server";
import { Hono } from "hono";
import usersRoute from "./routes/users-route.js";

const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

// add users route to app
const users = app.route("/users", usersRoute);

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
