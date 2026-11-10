import "dotenv/config";
import express from "express";
import path from "node:path";
import app from "./app.js";

const port = Number(process.env.PORT || 8787);

if (process.env.NODE_ENV === "production") {
  const clientBuild = path.resolve(process.cwd(), "dist");
  app.use(express.static(clientBuild));
  app.get("/{*path}", (_req, res) =>
    res.sendFile(path.join(clientBuild, "index.html")),
  );
}

app.listen(port, () =>
  console.log(`CartPilot API listening on http://localhost:${port}`),
);
