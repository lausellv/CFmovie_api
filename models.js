const mongoose = require('mongoose');


// defining the schema for both collections
let movieSchema = mongoose.Schema({
  Title : {type: String, required: true},
  Genre: {
    Name: String,
    Description: String
  },
  Director : {
    Name: String,
    Bio: String,
  },
  Actors: [String],
  ImagePath: String,
  Featured : Boolean,
  ReleaseYear: Date,
});

let userSchema = mongoose.Schema({
  Username : {type: String, required: true},
  Password: {type: String, required: true},
  email : {type: String, required: true},
  Birthday: Date,
  FavoriteMovies: [{type: mongoose.Schema.Types.ObjectId, ref : 'Movie'}]
});

let Movie = mongoose.model('Movie', movieSchema);
let User = mongoose.model('User', userSchema);

module.exports.Movie = Movie;
module.exports.User = User;