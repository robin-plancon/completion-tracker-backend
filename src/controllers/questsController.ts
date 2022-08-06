import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import mongoose from "mongoose";
import HttpError from "../models/httpError";
import Quest from "../models/quest";

const getQuests = async (req: Request, res: Response, next: NextFunction) => {
  let quests;
  try {
    quests = await Quest.find();
  } catch (err) {
    const error = new HttpError(
      "Fetching quests failed, please try again later.",
      500
    );
    return next(error);
  }
  res.status(200).json({
    quests: quests.map((quest) => quest.toObject({ getters: true })),
  });
};

const getQuest = async (req: Request, res: Response, next: NextFunction) => {
  const questId = req.params.questId;

  let quest;
  try {
    quest = await Quest.findById(questId);
  } catch (err) {
    const error = new HttpError("Fetching boss failed, please try later.", 500);
    return next(error);
  }

  if (!quest) {
    const error = new HttpError("Could not find quest for this id.", 401);
    return next(error);
  }

  res.status(200).json({ quest: quest.toObject({ getters: true }) });
};

const createQuest = async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    let errMsg = "";
    errors.array().forEach((err) => (errMsg += err.msg + " "));
    return next(new HttpError(errMsg, 422));
  }

  const { name, link, status } = req.body;

  const createdQuest = new Quest({ name, link, status });

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdQuest.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError("Creating boss failed, please try again.", 500);
    return next(error);
  }

  res.status(201).json({ quest: createdQuest });
};

const updateQuest = async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    let errMsg = "";
    errors.array().forEach((err) => (errMsg += err.msg + " "));
    return next(new HttpError(errMsg, 422));
  }

  const { name, link, status } = req.body;
  const questId = req.params.questId;

  const updateQuery: {
    name?: string;
    link?: string;
    status?: boolean;
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

  let result;
  try {
    result = await Quest.findByIdAndUpdate(questId, updateQuery, { new: true });
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update quest",
      500
    );
    return next(error);
  }

  if (!result) {
    const error = new HttpError("Could not find quest for this id.", 401);
    return next(error);
  }

  res.status(200).json({ quest: result.toObject({ getters: true }) });
};

// implementation des step avant
// const deleteQuest = async (req: Request, res: Response, next: NextFunction) => {

// }

const getSteps = async (req: Request, res: Response, next: NextFunction) => {
  const questId = req.params.questId;
  let steps;
  try {
    steps = await Quest.findById(questId, "steps");
  } catch (err) {
    const error = new HttpError(
      "Fetching steps failed, please try later.",
      500
    );
    return next(error);
  }

  if (!steps) {
    const error = new HttpError("Could not find quest for this id.", 401);
    return next(error);
  }

  res.status(200).json({ steps: steps.toObject({ getters: true }) });
};

const createStep = async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    let errMsg = "";
    errors.array().forEach((err) => (errMsg += err.msg + " "));
    return next(new HttpError(errMsg, 422));
  }

  const questId = req.params.questId;
  const {
    text,
    link,
    status,
  }: { text: string; link: string; status: boolean } = req.body;

  const createdStep = { text, link, status };

  let result;
  try {
    result = await Quest.findByIdAndUpdate(questId, {
      $push: { steps: createdStep },
    });
  } catch (err) {
    const error = new HttpError("Creating step failed, please try again.", 500);
    return next(error);
  }

  if (!result) {
    const error = new HttpError("Could not find quest for this id.", 401);
    return next(error);
  }

  res.status(201).json({ step: createdStep });
};

const updateStep = async (req: Request, res: Response, next: NextFunction) => {
  const stepId = req.params.stepId;

  const { text, link, status } = req.body;

  let result;
  try {
    result = await Quest.findOneAndUpdate(
      {"steps._id": stepId},
      { $set: { "steps.$.text": text, "steps.$.link": link, "steps.$.status": status } },
      { new: true }
    );
  } catch (err) {
    console.log(err);
    const error = new HttpError(
      "Something went wrong, could not update step.",
      500
    );
    return next(error);
  }

  if (!result) {
    const error = new HttpError(
      "Could not find step or quest for id's provided",
      401
    );
    return next(error);
  }

  res.status(200).json({ quest: result.toObject({ getters: true }) });
};

// a modifier

const deleteStep = async (req: Request, res: Response, next: NextFunction) => {
  const stepId = req.params.stepId;

  let result;
  try {
    result = await Quest.findOneAndUpdate(
      {"steps._id": stepId},
      { $pull: { steps: {_id: stepId}} },
      { new: true }
    );
  } catch (err) {
    console.log(err);
    const error = new HttpError(
      "Something went wrong, could not delete Step.",
      500
    );
    return next(error);
  }

  if (!result) {
    const error = new HttpError(
      "Could not find step or quest for id's provided",
      401
    );
    return next(error);
  }

  res
    .status(200)
    .json({
      message: "Step deleted",
      quest: result.toObject({ getters: true }),
    });
};

export {
  getQuests,
  getQuest,
  createQuest,
  updateQuest,
  getSteps,
  createStep,
  updateStep,
  deleteStep,
};
