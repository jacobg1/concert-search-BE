const express = require('express'),
      app = express(),
      bodyParser = require('body-parser')

const port = process.env.PORT || 3000

const getMeta = require('./routes/getMeta'),
      concertById = require('./routes/concertById')


// app.use(bodyParser.json())

app.use(getMeta, concertById)

app.listen(port, () => console.log(`Listening on port ${port}!`))