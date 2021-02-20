const express = require('express'),
  morgan = require('morgan'),
  app = express(),
  bodyParser = require('body-parser'),
  uuid = require('uuid');


app.use(morgan('common'));

// set static folder
app.use(express.static(path.join(__dirname,'public')));

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
  res.json(movies);
});

//get data about a single movie by title
app.get('/movies/:title', (req, res) => {
  let foundMovie = movies.find((movie) => {
    return movie.title === req.params.title
  })
  res.json(foundMovie);
});

// send documentation file
app.get('/documentation', (req, res) => {
  res.sendFile('public/documentation.html', { root: __dirname });
});

//Add data for a new movie to the movie list
app.post('/movies', (req, res) => {
  let newMovie = req.body;

  if (!newMovie.title) {
    const message = 'Missing movie "title" in request body';
    res.status(400).send(message);
  } else {
    newMovie.id = uuid.v4();
    movies.push(newMovie);
    res.status(201).send(newMovie);
  }
});


//delete a movie by title
app.delete('/movies/:title', (req, res) => {
  let movie = movies.find((movie) => {
    return movie.title === req.params.title
  });
  if (movie) {
    movies = movies.filter((obj) => {
      return obj.id !== req.params.id
    });
    res.status(201).send(`${req.params.title} was deleted.`);
  }
});

// update a user

app.put('/users/:username', (req, res) => {
  // in the list of users, find this user by username
  // when you find the user, change the property to what was passed in the body
  let user = users.find(user => user.username === req.params.username);
  if (!user) {
    return res.status(404).send('Not found');
  }

  return users.map((user) => {
    if (user.username === req.params.username) {
      user.username = req.body.username;
      user.email = req.body.email;
      return res.status(200).send({
        message: 'Sucessful PUT request updating user details',
        user: user });
    }
  });
});

//get all users
app.get('/users', (req, res) => {
  res.json(users);
});

//Add a new user
app.post('/users', (req, res) => {
  let newUser = req.body;

  if (!newUser.username) {
    const message = 'Missing "name" in request body';
    res.status(400).send(message);
  } else {
    newUser.id = uuid.v4();
    users.push(newUser);
    res.status(201).send(newUser);
  }
});


// allow users to update their info



app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});


// object variable with top movies
let movies = [
  {
    id: 1,
    title: 'Planet Earth II',
    description: 'Wildlife documentary series with David Attenborough, beginning with a look at the remote islands which offer sanctuary to some of the planet\'s rarest creatures, to the beauty of cities, which are home to humans, and animals..',
    genre: 'Documentary',
    director: 'David Attenborough',
    year: 2016
  },
  {
    id: 2,
    title: 'Seabiscuit',
    description: 'True story of the undersized Depression-era racehorse whose victories lifted not only the spirits of the team behind it but also those of their nation.',
    genre: ['Drama', 'History', 'Sport'],
    director: 'Gary Ross',
    year: 2003
  },
  {
    id: 3,
    title: 'If Beale Street Could Talk',
    description: 'A young woman embraces her pregnancy while she and her family set out to prove her childhood friend and lover innocent of a crime he didn\'t commit.',
    genre: 'Drama',
    director: 'Barry Jenkins',
    year: 2018
  },
  {
    id: 4,
    title: 'The Greatest Showman',
    description: 'P T Barnum becomes a worldwide sensation in the show business. His imagination and innovative ideas take him to the top of his game.',
    genre: 'Drama',
    director: 'Michael Gracey',
    year: 2017
  },
  {
    id: 5,
    title: 'Crazy Rich Asians',
    description: 'Rachel, a professor, dates a man named Nick and looks forward to meeting his family. However, she is shaken up when she learns that Nick belongs to one of the richest families in the country.',
    genre: 'Romance',
    director: 'Jon M. Chu',
    year: 2018
  },
  {
    id: 6,
    title: 'Joker',
    description: 'Arthur Fleck, a party clown, leads an impoverished life with his ailing mother. However, when society shuns him and brands him as a freak, he decides to embrace the life of crime and chaos.',
    genre: 'Thriller',
    director: 'Todd Phillips',
    year: 2019
  },
  {
    id: 7,
    title: 'Knives Out',
    description: 'The circumstances surrounding the death of crime novelist Harlan Thrombey are mysterious, but there is one thing that renowned Detective Benoit Blanc knows for sure - everyone in the wildly dysfunctional Thrombey family is a suspect.',
    genre: 'Mystery',
    director: 'Rian Johnson',
    image: 'knivesOut.png',
    year: 2019
  },
  {
    id: 8,
    title: 'The Great Gatsby',
    description: 'Nick Carraway, a World War I veteran who moves to New York with the hope of making it big, finds himself attracted to Jay Gatsby and his flamboyant lifestyle.',
    genre: 'Drama',
    director: 'Baz Luhrmann',
    year: 2013
  }
];


//object used to test the POST request on Postman
let addtlMovie = {
  title: 'The Notebook',
  description: "A poor yet passionate young man falls in love with a rich young woman, giving her a sense of freedom, but they are soon separated because of their social differences.",
  genre: 'Drama',
  director: "Nick Cassavetes",
  year: 2004
}

// users
let users = [{
  username: 'User Name',
  email: 'username@email.com'
}];

