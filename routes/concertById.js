const express = require('express'),
    router = express.Router(),
    axios = require('axios')

router.get('/concert/:id', function( req, res, next ) {
    
    // take in id parameter
    let concertId = req.params.id

    // build search url
    let url = 'https://archive.org/metadata/' + concertId

    // make api call
    axios({
        method: 'GET',
        url: url,
        dataType: 'jsonp'
    })
    .then(( response ) => {

        // build playback url base
        let { d1, dir } = response.data
        let base = 'https://' + d1 + dir + '/'

        // filter results for correct audio format
        let mp3Tracks = response.data.files.filter(function ( song ) {
            return song.format === 'VBR MP3'
        })

        // add the built play url as an object key
        mp3Tracks.forEach( track => {
            track.playUrl = base + track.name
        });

        // build response object
        let concertObject = {}

        // add metadata
        concertObject.metaData = response.data.metadata
        
        // add track list
        concertObject.trackList = mp3Tracks
        
        // send result to front end
        res.send( concertObject )

    })
    .catch(( error ) => {
        console.log( error )
    })

})

module.exports = router