const express = require('express');
morgan = require('morgan');
const app = express();

app.use(morgan('common'));

app.use(express.static('public'));

//in case we get an error
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

//get request
app.get('/', (req, res) => {
  res.send('Welcome to my MyFlix!');
});

app.get('/secreturl', (req, res) => {
  res.send('This is a secret url with super top-secret content.');
});

app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});

let movies = [
  {
    title: 'Planet Earth II',
    description: 'Wildlife documentary series with David Attenborough, beginning with a look at the remote islands which offer sanctuary to some of the planet\'s rarest creatures, to the beauty of cities, which are home to humans, and animals..',
    genre: 'Documentary',
    director: 'David Attenborough',
    year: 2016
  },
  {
    title: 'Seabiscuit',
    description: 'True story of the undersized Depression-era racehorse whose victories lifted not only the spirits of the team behind it but also those of their nation.',
    genre: ['Drama', 'History', 'Sport'],
    director: 'Gary Ross',
    year: 2003
  },
  {
    title: 'If Beale Street Could Talk',
    description: 'A young woman embraces her pregnancy while she and her family set out to prove her childhood friend and lover innocent of a crime he didn\'t commit.',
    genre: 'Drama',
    director: 'Barry Jenkins',
    year: 2018
  }
];

// GET request
app.get('/documentation', (req, res) => {                  
  res.sendFile('public/documentation.html', { root: __dirname });
});
