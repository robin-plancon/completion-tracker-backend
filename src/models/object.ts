import mongoose from "mongoose";
import uniqueValidator from "mongoose-unique-validator";

const Schema = mongoose.Schema;

interface Iobject {
  categoryId: mongoose.Types.ObjectId,
  name: string,
  link?: string,
  status: boolean,
  location?: string,
  details?: string
}

const ObjectSchema = new Schema({
  categoryId: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: "Category",
  },
  name: { type: String, required: true },
  link: { type: String, required: false },
  status: { type: Boolean, required: true, default: false },
  location: { type: String, required: false },
  details: { type: String, require: false },
});

ObjectSchema.plugin(uniqueValidator);

const Object = mongoose.model<Iobject>("Object", ObjectSchema);

export = Object;