const express = require('express'),
      app = express(),
      bodyParser = require('body-parser'),
			cors = require('cors')

const port = process.env.PORT || 3001

const getMeta = require('./routes/getMeta'),
      concertById = require('./routes/concertById'),
      randomSong = require('./routes/randomSong'),
      randomSongById = require('./routes/randomSongById')
app.use(cors())
app.use( getMeta, concertById, randomSong, randomSongById )

app.listen( port, () => console.log(`Listening on port ${ port }!`))