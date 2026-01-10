import express, { Express, Request, Response } from "express";

const app: Express = express();
const PORT = process.env.PORT || 3000;

app.get("/health", (req: Request, res: Response) => {
  res.send("Hello World from TypeScript Express!");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
