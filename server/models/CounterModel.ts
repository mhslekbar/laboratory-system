// server/models/Counter.ts
import mongoose, { Schema, Document } from "mongoose";
export interface Counter extends Document { name: string; seq: number; }
const CounterSchema = new Schema<Counter>({
  name: { type: String, required: true, unique: true },
  seq:  { type: Number, required: true, default: 0 }
});
export default mongoose.model<Counter>("counter", CounterSchema);

