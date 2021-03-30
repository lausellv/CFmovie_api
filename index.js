const express = require('express'),
  morgan = require ('morgan'),
  uuid = require('uuid'),
  mongoose = require('mongoose'),
  Models = require('./models.js'),
  app = express(),
  bodyParser = require('body-parser');

const Movies = Models.Movie;
const Users = Models.User;

mongoose.connect('mongodb://localhost:27017/myFlixDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(morgan('common'));

// create a middleware to log things to see if it works
const logger = (req, res, next) => {
  console.log("It's working");
  next();
};
//init middleware
app.use(logger);

// set static folder
app.use(express.static('public'));

app.use(bodyParser.json());

//in case we get an error - middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

//get requests
app.get('/', (req, res) => {
  res.status(200).send('Welcome to my My Flix!');
});

// Gets the list of data about ALL movies
app.get('/movies', (req, res) => {
  Movies.find()
  .then(movies => {
    res.status(200).json(movies);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

//get data about a single movie by title
app.get('/movies/:title', (req, res) => {
  Movies.findOne({ Title: req.params.title })
  .then((movie) => {
    res.json(movie);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });

});



// send documentation file
app.get('./documentation', (req, res) => {
  res.sendFile('documentation.html');
});



//delete a movie by title
app.delete('/movies/:title', (req, res) => {
  Movies.findOne({ 'Title': req.params.title })
  .then((movies) => {
    res.json(movies);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});


//GET data about a director by their name (using his name in the query)
app.get('/movies/directors/:name', (req, res) => {
  Movies.findOne({'Director.Name': req.params.name})
      .then((director) => {
        res.json(director.Director);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
});

//GET movies by genre
app.get('/movies/genres/:genre', (req, res) => {
  Movies.find({ 'Genre.Name': req.params.genre })
  .then((movies) => {
    res.json(movies);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

// update a user
app.put('/users/:Username', (req, res) => {
  // in the list of users, find this user by username
  // when you find the user, change the property to what was passed in the body
  Users.findOne(user => user.Username === req.params.Username);
  if (!User) {
    return res.status(404).send('Not found');
  }

  return Users.map((User) => {
    if (User.Username === req.params.Username) {
      User.Username = req.body.Username;
      User.Email = req.body.Email;
      return res.status(201).send({
        message: 'Sucessful PUT request updating user details',
        User: User,
      });
    }
  });
});

//GET a list of all users
app.get('/users', (req, res) => {
  Users.find()
    .then(users => {
      res.status(200).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// get a user by username using Mongoose
app.get('/users/:Username', (req, res) => {
  console.log(req.params.Username )
  Users.findOne({ Username: req.params.Username })
    .then((user) => {
    
     res.json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//ADD a new user
app.post('/users', (req, res) => {
  Users.findOne({ Username: req.body.Username })
    .then(user => {
      if (user) {
        return res.status(400).send(req.body.Username + 'already exists');
      } else {
        Users.create({
          Username: req.body.Username,
          Password: req.body.Password,
          Email: req.body.Email,
          Birthday: req.body.Birthday,
        })
          .then((user) => {
            res.status(201).json(user);
          })
          .catch((error) => {
            console.error(error);
            res.status(500).send('Error: ' + error);
          });
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});

//DELETE a user
app.delete('/users/:Username', (req, res) => {
  Users.findOneAndRemove({ Username: req.params.Username })
  .then((user) => {
    if (!user) {
      res.status(400).send(req.params.Username + ' was not found');
    } else {
      res.status(200).send(req.params.Username + ' was deleted.');
    }
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

app.listen(5000, () => console.log(`App is listening on port 5000`));


// add (using post ) a favorite movie to user
app.post('/users/:Username/movies/:MovieID', (req, res) => {
  Users.findOneAndUpdate({Username: req.params.Username}, {
    $push: {FavoriteMovies: req.params.MovieID},
  },
  {new: true}, // This line makes sure that the updated document is returned
  (err, updatedUser) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});

// DELETE  a fav movie from a user's list of favorites
app.delete('/users/:Username/Movies/:MovieID', (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, {
     $pull: { FavoriteMovies: req.params.MovieID }
   },
   { new: true }, // This line makes sure that the updated document is returned
  (err, updatedUser) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});







