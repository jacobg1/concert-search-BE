const express = require('express'),
      router = express.Router()

router.get('/meta/:artistName/:artistYear?', function (req, res, next) {
    
    let artist = req.params.artistName
    let year = req.params.artistYear || ''

    let responseObject = {
        artist: artist
    }
    if(year) responseObject.year = year

    res.send(responseObject)
    
})      

module.exports = router