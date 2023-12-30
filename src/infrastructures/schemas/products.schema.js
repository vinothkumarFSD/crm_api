const mongoose = require('mongoose');

/* The code is defining a Mongoose schema for a contact object. The schema specifies the structure and
validation rules for the contact object. */
const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: String, required: true },
    is_deleted: { type: Boolean, default: false },
    deleted_at: { type: String, default: null },
  },
  { timestamps: true },
);

module.exports = mongoose.model('products', ProductSchema);
