import mongoose from "mongoose";
import uniqueValidator from "mongoose-unique-validator";

const Schema = mongoose.Schema;

interface Iboss {
  name: string;
  link?: string;
  status: boolean;
  location: string;
}

const bossSchema = new Schema({
  name: { type: String, required: true, unique: true },
  link: { type: String, required: false },
  status: { type: Boolean, required: true, default: false },
  location: { type: String, required: true },
});

bossSchema.plugin(uniqueValidator);

const Boss = mongoose.model<Iboss>("Boss", bossSchema);

export default Boss;
