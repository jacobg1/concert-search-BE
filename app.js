const express = require('express'),
      app = express(),
      bodyParser = require('body-parser')

const port = process.env.PORT || 3000

const getMeta = require('./routes/getMeta'),
      concertById = require('./routes/concertById'),
      randomSong = require('./routes/randomSong')


// app.use(bodyParser.json())

app.use( getMeta, concertById, randomSong )

app.listen( port, () => console.log(`Listening on port ${ port }!`))