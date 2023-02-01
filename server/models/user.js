const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: String,
  googleid: String,
  game: { type: Number, default: 0 },
  kill: { type: Number, default: 0 },
  scallion: { type: Number, default: 0 },
  // garlic: { type: Number, default: 0 },
  // pepper: { type: Number, default: 0 },
  fishcake: { type: Number, default: 0 },
  seaweed: { type: Number, default: 0 },
  // tomato: { type: Number, default: 0 },
  // sarah: { type: Number, default: 0 },
  // rice: { type: Number, default: 0 },
  // ramen: { type: Number, default: 0 },
  // shakshuka: { type: Number, default: 0 },
  costume: { type: Number, default: 0 },
});

// compile model from schema
module.exports = mongoose.model("user", UserSchema);
