const express = require('express'),
      app = express(),
      bodyParser = require('body-parser')

const port = process.env.PORT || 3000

const getMeta = require('./routes/getMeta')


app.use(bodyParser.json())

app.use(getMeta)

app.listen(port, () => console.log(`Listening on port ${port}!`))