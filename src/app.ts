import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";

import categoryRouter from "./routes/categoryRoutes";
import bossRouter from "./routes/bossesRoutes";
import questRouter from "./routes/questsRoutes";
import HttpError from "./models/httpError";

const app = express();

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
  next();
});

app.use("/api/categories", categoryRouter);

app.use("/api/bosses", bossRouter);

app.use("/api/quests", questRouter);

app.use(
  (
    error: HttpError,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    if (res.headersSent) {
      return next(error);
    }
    res.status(error.code || 500);
    res.json({ message: error.message || "An unknown error occured!" });
  }
);

mongoose
  .connect( `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_CLUSTER}/${process.env.DB_NAME}?retryWrites=true&w=majority`)
  .then(() => {
    app.listen(5000);
  })
  .catch((err) => {
    console.log(err);
  });
