import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import mongoose from "mongoose";
import Boss from "../models/boss";
import HttpError from "../models/httpError";

const getBosses = async (req: Request, res: Response, next: NextFunction) => {
  let bosses;
  try {
    bosses = await Boss.find();
  } catch (err) {
    const error = new HttpError(
      "Fetching bosses failed, please try again later.",
      500
    );
    return next(error);
  }
  res.status(200).json({
    bosses: bosses.map((boss) => boss.toObject({ getters: true })),
  });
};

const getBoss = async (req: Request, res: Response, next: NextFunction) => {
  const bossId = req.params.bossId;

  let boss;
  try {
    boss = await Boss.findById(bossId);
  } catch (err) {
    const error = new HttpError("Fetching boss failed, please try later.", 500);
    return next(error);
  }

  if (!boss) {
    const error = new HttpError("Could not find boss for this id.", 404);
    return next(error);
  }

  res.status(200).json({ boss: boss.toObject({ getters: true }) });
};

const createBoss = async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    let errMsg = "";
    errors.array().forEach((err) => (errMsg += err.msg + " "));
    return next(new HttpError(errMsg, 422));
  }

  const { name, link, location } = req.body;

  const createdBoss = new Boss({ name, link, location });

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdBoss.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError("Creating boss failed, please try again.", 500);
    return next(error);
  }

  res.status(201).json({ boss: createdBoss });
};

const updateBoss = async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    let errMsg = "";
    errors.array().forEach((err) => (errMsg += err.msg + " "));
    return next(new HttpError(errMsg, 422));
  }

  const { name, link, status, location } = req.body;
  const bossId = req.params.bossId;

  const updateQuery: {
    name?: string;
    link?: string;
    status?: boolean;
    location?: string;
  } = {};

  if (name) {
    updateQuery.name = name;
  }

  if (link) {
    updateQuery.link = link;
  }

  if (status) {
    updateQuery.status = status;
  }

  if (location) {
    updateQuery.location = location;
  }

  let result;
  try {
    result = await Boss.findByIdAndUpdate(bossId, updateQuery, { new: true });
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update boss.",
      500
    );
    return next(error);
  }

  if (!result) {
    const error = new HttpError("Could not find boss for this id.", 401);
    return next(error);
  }

  res.status(200).json({ boss: result.toObject({ getters: true }) });
};

const deleteBoss = async (req: Request, res: Response, next: NextFunction) => {
  const bossId = req.params.bossId;

  let result;
  try {
    result = Boss.findByIdAndRemove(bossId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not delete Boss.",
      500
    );
    return next(error);
  }

  if (!result) {
    const error = new HttpError("Could not find boss for this id.", 401);
    return next(error);
  }

  res.status(200).json({ message: "Boss deleted" });
};

export { getBosses, getBoss, createBoss, updateBoss, deleteBoss };
