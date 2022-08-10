import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import mongoose from "mongoose";
import Category from "../models/category";
import HttpError from "../models/httpError";
import Object from "../models/object";

const getAllObjects = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let objects;

  try {
    objects = await Object.find();
  } catch (err) {
    const error = new HttpError(
      "Fetching objects failed, please try later.",
      500
    );
    return next(error);
  }

  res.status(200).json({
    objects: objects.map((object) => object.toObject({ getters: true })),
  });
};

const getObjectsFromCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const categoryId = req.params.categoryId;
  let objects;
  try {
    objects = await Object.find({ categoryId: categoryId });
  } catch (err) {
    const error = new HttpError(
      "Fetching objects failed, please try later.",
      500
    );
    return next(error);
  }

  if (!objects) {
    const error = new HttpError("Could not find category for this id.", 401);
    return next(error);
  }

  res.status(200).json({
    objects: objects.map((object) => object.toObject({ getters: true })),
  });
};

const createObject = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    let errMsg = "";
    errors.array().forEach((err) => (errMsg += err.msg + " "));
    return next(new HttpError(errMsg, 422));
  }

  const {
    categoryId,
    name,
    link,
    status,
    location,
    details,
  }: {
    categoryId: mongoose.Types.ObjectId;
    name: string;
    link?: string;
    status: boolean;
    location?: string;
    details?: string;
  } = req.body;

  const createdObject = new Object({
    categoryId,
    name,
    link,
    status,
    location,
    details,
  });

  let category;
  try {
    category = await Category.findById(categoryId);
  } catch (err) {
    const error = new HttpError(
      "Creating object failed, please try again",
      500
    );
    return next(error);
  }

  if (!category) {
    const error = new HttpError("Could not find category for this id.", 401);
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdObject.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    console.log(err);
    const error = new HttpError(
      "Creating object failed, please try again.",
      500
    );
    return next(error);
  }

  res.status(200).json({ object: createdObject });
};

const updateObject = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    let errMsg = "";
    errors.array().forEach((err) => (errMsg += err.msg + " "));
    return next(new HttpError(errMsg, 422));
  }

  const {
    name,
    link,
    status,
    location,
    details,
  }: {
    name: string;
    link: string;
    status: boolean;
    location: string;
    details: string;
  } = req.body;
  const objectId = req.params.objectId;

  const updateQuery: {
    name?: string;
    link?: string;
    status?: boolean;
    location?: string;
    details?: string;
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

  if (details) {
    updateQuery.details = details;
  }

  let result;
  try {
    result = await Object.findByIdAndUpdate(objectId, updateQuery, {
      new: true,
    });
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update object",
      500
    );
    return next(error);
  }

  if (!result) {
    const error = new HttpError("Could not find object for this id.", 401);
    return next(error);
  }

  res.status(200).json({ object: result.toObject({ getters: true }) });
};

const deleteObject = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const objectId = req.params.objectId;

  let result;
  try {
    result = await Object.findByIdAndRemove(objectId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not delete object.",
      500
    );
    return next(error);
  }

  if(!result) {
    const error = new HttpError("Could not find object for this id.", 404);
    return next(error);
  }

  res.status(200).json({message: "Object deleted."});
};

export { getAllObjects, getObjectsFromCategory, createObject, updateObject, deleteObject };
