const express = require("express"),
  morgan = require("morgan"),
  uuid = require("uuid"),
  mongoose = require("mongoose"),
  Models = require("./models.js"),
  bodyParser = require("body-parser"),
  passport = require("passport"),
  cors = require("cors"),
  app = express();
//imports Movie and User modules from mongodb collections
const Movies = Models.Movie;
const Users = Models.User;
require("./passport");

//imports express-validator module for server-side validation
const { check, validationResult, body } = require("express-validator");

let allowedOrigins = ["http://localhost:8080", "http://testsite.com", "http://localhost:1234","http://localhost:1234", "https://cf-my-movie-app.herokuapp", "https://cf-myflix.netlify.app"];

//middleware

app.use(bodyParser.urlencoded());
app.use(bodyParser.json());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        let message =
          "The CORS policy for this application doesn't allow access from origin " + origin;
        return callback(new Error(message), false);
      }
      return callback(null, true);
    }
  })
);

// importing auth.js file
let auth = require("./auth")(app); // must be after the bodyParser function
mongoose.connect(process.env.CONNECTION_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: true
});

// middleware -
//set static folder
app.use(express.static("public"));

app.use(morgan("common"));

// create a middleware to log things to see if it works
const logger = (req, res, next) => {
  console.log("It's working");
  next();
};
//init middleware
app.use(logger);

//in case we get an error - middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

//get requests
app.get("/", (req, res) => {
  res.status(200).send("Welcome to my My Flix!");
});

// Gets the list of data about ALL movies
app.get(
  "/movies",
  /*passport.authenticate('jwt', {session: false}),*/ (req, res) => {
    Movies.find()
      .then(movies => {
        res.status(201).json(movies);
      })
      .catch(err => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

//get data about a single movie by title
app.get(
  "/movies/:title",
  passport.authenticate("jwt", { session: false }),
  /*authentication needed before completing request*/ (req, res) => {
    Movies.findOne({ Title: req.params.title })
      .then(movie => {
        res.json(movie);
      })
      .catch(err => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

// send documentation file
app.get("/documentation", (req, res) => {
  res.sendFile(__dirname + "/public/documentation.html");
});

//delete a movie by title
app.delete("/movies/:title", passport.authenticate("jwt", { session: false }), (req, res) => {
  /*authentication needed before completing request*/
  Movies.findOne({ Title: req.params.title })
    .then(movies => {
      res.json(movies);
    })
    .catch(err => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

//GET data about a director by their name (using his name in the query)
app.get("/movies/directors/:name", passport.authenticate("jwt", { session: false }), (req, res) => {
  /*authentication needed before completing request*/
  Movies.findOne({ "Director.Name": req.params.name })
    .then(director => {
      res.json(director.Director);
    })
    .catch(err => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

//GET movies by genre
app.get("/movies/genres/:genre", passport.authenticate("jwt", { session: false }), (req, res) => {
  /*authentication needed before completing request*/
  Movies.find({ "Genre.Name": req.params.genre })
    .then(movies => {
      res.json(movies);
    })
    .catch(err => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

// update a user
app.put(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  [
    check("Username", "Username is required").isLength({ min: 5 }),
    check(
      "Username",
      "Username contains non alphanumeric characters - not allowed."
    ).isAlphanumeric(),
    check("Password", "Password is required").not().isEmpty(),
    check("Email", "Email does not appear to be valid").isEmail()
  ],
  (req, res) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $set: {
          Username: req.body.Username,
          Password: hashedPassword,
          Email: req.body.Email,
          Birthday: req.body.Birthday
        }
      },
      { new: true },
      (err, updatedUser) => {
        if (err) {
          console.error(err);
          res.status(500).send("Error: " + err);
        } else {
          res.json(updatedUser);
        }
      }
    );
  }
);

//GET a list of all users
app.get("/users", passport.authenticate("jwt", { session: false }), (req, res) => {
  Users.find()
    .then(users => {
      res.status(200).json(users);
    })
    .catch(err => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

// get a user by username using Mongoose
app.get("/users/:Username", passport.authenticate("jwt", { session: false }), (req, res) => {
  /*authentication needed before completing request*/
  console.log(req.params.Username);
  Users.findOne({ Username: req.params.Username })
    .then(user => {
      res.json(user);
    })
    .catch(err => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

//ADD a new user
app.post(
  "/users", // Validation logic here for request
  //you can either use a chain of methods like .not().isEmpty()
  //which means "opposite of isEmpty" in plain english "is not empty"
  //or use .isLength({min: 5}) which means
  //minimum value of 5 characters are only allowed
  [
    check("Username", "Username is required").isLength({ min: 5 }),
    check(
      "Username",
      "Username contains non alphanumeric characters - not allowed."
    ).isAlphanumeric(),
    check("Password", "Password is required").not().isEmpty(),
    check("Email", "Email does not appear to be valid").isEmail()
  ],
  (req, res) => {
    // check the validation object for errors
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOne({ Username: req.body.Username }) //search for existence of such Username
      .then(user => {
        if (user) {
          return res.status(400).send(req.body.Username + " already exists"); //send response user already exists
        } else {
          Users.create({
            Username: req.body.Username,
            Password: hashedPassword,
            Email: req.body.Email,
            Birthday: req.body.Birthday
          })
            .then(user => {
              res.status(201).json(user);
            })
            .catch(error => {
              console.error(error);
              res.status(500).send("Error: " + error);
            });
        }
      })
      .catch(error => {
        console.error(error);
        res.status(500).send("Error: " + error);
      });
  }
);

//DELETE a user by username
app.delete("/users/:Username", passport.authenticate("jwt", { session: false }), (req, res) => {
  /*authentication needed before completing request*/
  Users.findOneAndRemove({ Username: req.params.Username })
    .then(user => {
      if (!user) {
        res.status(400).send(req.params.Username + " was not found");
      } else {
        res.status(200).send(req.params.Username + " was deleted.");
      }
    })
    .catch(err => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

// add (using post ) a favorite movie to user
app.post(
  "/users/:Username/movies/:MovieID",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $push: { FavoriteMovies: req.params.MovieID }
      },
      { new: true }, // This line makes sure that the updated document is returned
      (err, updatedUser) => {
        if (err) {
          console.error(err);
          res.status(500).send("Error: " + err);
        } else {
          res.json(updatedUser);
        }
      }
    );
  }
);

// Users.findOneAndUpdate({Username: req.params.Username}, {$pull: {FavoriteMovies: req.params.MovieID}}, function(err, data){
//   console.log(err, data);
// });

app.delete(
  "/users/:Username/movies/:MovieID",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    // Users.findOne({ Username: req.params.Username })             // Promise
    //   .then((user) => {
    //       Users.findOneAndUpdate({ Username: req.params.Username }, {
    //         $pull: { FavoriteMovies: req.params.MovieID }
    //       },
    //         { new: true })                                // To return updated document
    //         .then((updatedUser) => {
    //           res.json(updatedUser)
    //         })
    //         .catch((err) => {                             // Final catch-all
    //           res.status(500).send('Error: ' + err);
    //         })
    //   });
    console.log(req.params.MovieID);
    Users.findOneAndUpdate(
      { Username: req.params.Username },
      { $pull: { FavoriteMovies: req.params.MovieID } }
    )
      .exec()
      .then(updatedUser => {
        console.log("updat====edUser", updatedUser);
        res.json(updatedUser);
      })
      .catch(err => {
        console.log("uperr===edUser", err);
        // Final catch-all
        res.status(500).send("Error: " + err);
      });
  }
);

//listen for requests
const port = process.env.PORT || 8080;
app.listen(port, "0.0.0.0", () => {
  console.log("Listening on Port " + port);
});
