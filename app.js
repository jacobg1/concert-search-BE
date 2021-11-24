const express = require('express'),
	app = express(),
	bodyParser = require('body-parser'),
	helmet = require('helmet'),
	compression = require('compression')

const port = process.env.PORT || 3001

const getMeta = require('./routes/getMeta'),
	concertById = require('./routes/concertById'),
	randomSong = require('./routes/randomSong'),
	randomSongById = require('./routes/randomSongById')

// CORS middleware
const allowCrossDomain = function (req, res, next) {

	// Allowing all for now, change in prod
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Methods', 'GET');
	res.header('Access-Control-Allow-Headers', 'Content-Type');

	next();
}
app.use(compression())
app.use(helmet())
app.use(bodyParser.json())
app.use(allowCrossDomain, getMeta, concertById, randomSong, randomSongById)

app.listen(port, () => console.log(`Listening on port ${ port }!`))