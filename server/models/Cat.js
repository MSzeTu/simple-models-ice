const mongoose = require('mongoose');

let CatModel = {};

const CatSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  bedsOwned: {
    type: Number,
    min: 0,
    required: true,
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
});

CatSchema.statics.findByName = (name, callback) => {
  const search = {
    name,
  };

  return CatModel.findOne(search, callback);
};

CatModel = mongoose.model('Cat', CatSchema);

module.exports.CatModel = CatModel;
module.exports.CatSchema = CatSchema;
