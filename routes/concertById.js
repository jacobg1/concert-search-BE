const express = require('express'),
    router = express.Router(),
    axios = require('axios'),
    redis = require('redis'),
    client = redis.createClient()

    // handle redis errors
    client.on('error', function ( err ) {
        console.log('Error ' + err);
    });

router.get('/concert/:id', function( req, res, next ) {
    
    // take in id parameter
    let concertId = req.params.id

    // build search url
    let url = 'https://archive.org/metadata/' + concertId

    // check if exists in redis storage
    client.exists( concertId, function ( err, reply) {

        // exists() returns 1 if exists
        if ( reply === 1) {

            console.log('fetching from redis store')

            // get result from redis instead of making api call
            client.get( concertId, function ( error, result) {

                // handle errors
                if ( error ) throw error

                // send result
                res.send(JSON.parse( result ))
            })

        } else {
            
            console.log('fetching from api')

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
                let mp3Tracks = response.data.files.filter(function (song) {
                    return song.format === 'VBR MP3'
                })

                // add the built play url as an object key
                mp3Tracks.forEach( track => {
                    track.playUrl = base + track.name.replace(/ /g, '%20')
                });

                // build response object
                let concertObject = {}

                // add metadata
                concertObject.metaData = response.data.metadata

                // add track list
                concertObject.trackList = mp3Tracks

                // save concert object in redis cache
                client.set( concertId, JSON.stringify( concertObject ))

                // send result to front end
                res.send( concertObject )

            })
            .catch(( error ) => {
                console.log( error )
            })
        }
    })        
})

module.exports = router


  