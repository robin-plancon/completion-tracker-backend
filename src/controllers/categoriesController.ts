import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import mongoose from "mongoose";
import Category from "../models/category";
import HttpError from "../models/httpError";
import Object from "../models/object";

const getCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let categories;
  try {
    categories = await Category.find();
  } catch (err) {
    const error = new HttpError(
      "Fetching categories failed, please try again later.",
      500
    );
    return next(error);
  }
  res.json({
    categories: categories.map((category) =>
      category.toObject({ getters: true })
    ),
  });
};

const getCategory = async (req: Request, res: Response, next: NextFunction) => {
  const categoryId = req.params.categoryId;

  let categorySearched;

  try {
    categorySearched = await Category.findById(categoryId);
  } catch (err) {
    const error = new HttpError(
      "Fetching category failed, please try later.",
      500
    );
    return next(error);
  }

  if (!categorySearched) {
    const error = new HttpError("Could not find category for this id.", 401);
    return next(error);
  }

  res.json({ category: categorySearched.toObject({ getters: true }) });
};

const getCategoriesTree = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let tree;

  try {
    tree = await Category.aggregate().graphLookup({from: "categories", startWith: "$parent", connectFromField: "parent", connectToField: "_id", as: "parents"});
  } catch (err) {
    const error = new HttpError("Fetching categories tree failed, please try again later.", 500);
    return next(error);
  }
  res.status(200).json({
    tree: tree
  });
};

const getRootCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let categories;

  try {
    categories = await Category.find({ parent: undefined || null });
  } catch (err) {
    console.log(err);
    const error = new HttpError(
      "Fetching categories failed, please try again later.",
      500
    );
    return next(error);
  }

  if(!categories) {
    const error = new HttpError(
      "Could not find categories.",
      401
    );
    return next(error);
  }

  res.status(200).json({
    categories: categories.map((category) =>
      category.toObject({ getters: true })
    ),
  });
};

const getChildsCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const parentCategoryId = req.params.parentCategoryId;

  let categories;

  try {
    categories = await Category.find({ parent: parentCategoryId });
  } catch (err) {
    const error = new HttpError(
      "Fetching categories failed, please try again later.",
      500
    );
    return next(error);
  }
  res.json({
    categories: categories.map((category) =>
      category.toObject({ getters: true })
    ),
  });
};

const createCategory = async (
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

  const { name, link, parent } = req.body;

  const createdCategory = new Category({
    name,
    link,
    parent
  });

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdCategory.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      "Creating category failed, please try again.",
      500
    );
    return next(error);
  }

  res.status(201).json({ category: createdCategory });
};

const updateCategory = async (
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

  const { name, link, parent } = req.body;
  const categoryId = req.params.categoryId;

  const updateQuery: { name?: string; link?: string; parent?: mongoose.Types.ObjectId } = {};

  if (name) {
    updateQuery.name = name;
  }

  if (link) {
    updateQuery.link = link;
  }

  if (parent) {
    updateQuery.parent = parent;
  }

  let result;
  try {
    result = await Category.findByIdAndUpdate(categoryId, updateQuery, {
      new: true,
    });
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update category.",
      500
    );
    return next(error);
  }

  if (!result) {
    const error = new HttpError("Could not find category for this id.", 401);
    return next(error);
  }

  res.status(200).json({ category: result.toObject({ getters: true }) });
};

const deleteCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const categoryId = req.params.categoryId;

  let resultCategory;
  try {
    resultCategory = await Category.findByIdAndRemove(categoryId);
    await Object.deleteMany({categoryId: categoryId});
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not delete category.",
      500
    );
    return next(error);
  }

  if (!resultCategory) {
    const error = new HttpError("Could not find category for this id.", 404);
    return next(error);
  }

  res.status(200).json({ message: "Category deleted." });
};

export {
  getCategories,
  getCategory,
  getCategoriesTree,
  getRootCategories,
  getChildsCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
