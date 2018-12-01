const express = require('express'),
      app = express(),
      bodyParser = require('body-parser')

const port = process.env.PORT || 3000

app.use(bodyParser.json())

app.get('/', function (req, res, next)  {
    res.send('hello world')
})

app.listen(port, () => console.log(`Listening on port ${port}!`))