const express = require('express'),
      router = express.Router(),
      axios = require('axios')
      redis = require('redis'),
      client = redis.createClient()

    // handle redis errors
    client.on('error', function ( err ) {
        console.log('Error ' + err);
    });


router.get('/random/:artistName/:artistYear?', function (req, res, next) {
    
    // take in and format search params, year is optional so
    // only add year if it exists as part of search
    let artist = req.params.artistName.replace(/ /g, '+')
    let year = req.params.artistYear || ''
    let searchParams = artist
    if (year) searchParams += '+AND+year%3A' + year

    // build meta search url, this will return ids
    // for use in metadata search
    let url = 'https://archive.org/advancedsearch.php?q=creator%3A' + searchParams + '&fl%5B%5D=identifier&fl%5B%5D=mediatype&fl%5B%5D=title&&fl%5B%5D=description&fl%5B%5D=year&sort%5B%5D=year+asc&sort%5B%5D=&sort%5B%5D=&rows=150&page=&output=json'
    
    // check if exists in redis storage
    client.exists( searchParams, function ( err, reply ) {

        // exists() returns 1 if exists
        if ( reply === 1) {

            console.log('fetching from redis store')

            // get result from redis instead of making api call
            client.get( searchParams, function ( error, result ) {

                // handle errors
                if ( error ) throw error

                // get a random concert id based on user input
                let parseResult = JSON.parse( result )
                let randomId = parseResult[ Math.floor( Math.random() * parseResult.length ) ].identifier    
                // let randomId = 'gd1969-02-28.139196.sbd.2track.Gastwirt.Miller.Noel.t-flac16'
                // check if exists in redis storage
                client.exists( randomId, function ( err, reply ) {

                    // exists() returns 1 if exists
                    if ( reply === 1 ) {

                        console.log('fetching concert from redis store')

                        // get result from redis instead of making api call
                        client.get( randomId, function ( error, result ) {

                            // handle errors
                            if ( error ) throw error

                            // send random track
                            let parseTrackResult = JSON.parse( result ).trackList
                            let randomTrack = parseTrackResult[ Math.floor( Math.random() * parseTrackResult.length )]
                            res.send( randomTrack )
                        })

                    } else {
                        console.log('id doesent exist fetching from api')
                        // build search url with random id
                        let concertUrl = 'https://archive.org/metadata/' + randomId
                        console.log( randomId )
                        // make api call
                        axios({
                            method: 'GET',
                            url: concertUrl,
                            dataType: 'jsonp'
                        })
                            .then(( response ) => {
                              
                                // build playback url base
                                let { d1, dir } = response.data
                                let base = 'https://' + d1 + dir + '/'

                                // filter results for correct audio format
                                let mp3Tracks = response.data.files.filter( function ( song ) {
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
                                client.set( randomId, JSON.stringify( concertObject ))

                                // send result to front end
                                let { trackList } = concertObject
                                let randomTrack = trackList[ Math.floor( Math.random() * trackList.length )]
                                res.send( randomTrack )

                            })
                            .catch(( error ) => {
                                console.log( error )
                            })
                    }
                })        
            })

        } else {

            console.log('fetching meta from api')
            
            // make api call to get ids
            axios({
                method: 'GET',
                url: url,
                dataType: 'jsonp',
            })
            .then(( response ) => {

                // set hash in redis storage
                client.set( searchParams, JSON.stringify( response.data.response.docs ))
                
                // get random concert
                let responseData = response.data.response.docs
                let randomConcert = responseData[ Math.floor(Math.random() * responseData.length )].identifier 
                // let randomConcert = 'gd1969-02-28.139196.sbd.2track.Gastwirt.Miller.Noel.t-flac16'
                client.exists( randomConcert, function ( err, reply ) {

                    // exists() returns 1 if exists
                    if ( reply === 1 ) {

                        console.log('fetching concert from redis store')

                        // get result from redis instead of making api call
                        client.get( randomConcert, function ( error, result ) {

                            // handle errors
                            if ( error ) throw error

                            // send random track
                            let parseTrackResult = JSON.parse(result).trackList
                            let randomTrack = parseTrackResult[Math.floor(Math.random() * parseTrackResult.length)]
                            res.send(randomTrack)
                        })
                    } else {
                        console.log('doesnt exist need to make api call')
                        let concertUrl = 'https://archive.org/metadata/' + randomConcert
                        
                        // make api call
                        axios({
                            method: 'GET',
                            url: concertUrl,
                            dataType: 'jsonp'
                        })
                        .then((response) => {

                            // build playback url base
                            let { d1, dir } = response.data
                            let base = 'https://' + d1 + dir + '/'

                            // filter results for correct audio format
                            let mp3Tracks = response.data.files.filter(function (song) {
                                return song.format === 'VBR MP3'
                            })

                            // add the built play url as an object key
                            mp3Tracks.forEach(track => {
                                track.playUrl = base + track.name.replace(/ /g, '%20')
                            });

                            // build response object
                            let concertObject = {}

                            // add metadata
                            concertObject.metaData = response.data.metadata

                            // add track list
                            concertObject.trackList = mp3Tracks

                            // save concert object in redis cache
                            client.set( randomConcert, JSON.stringify(concertObject))

                            // send result to front end
                            let { trackList } = concertObject
                            let randomTrack = trackList[Math.floor(Math.random() * trackList.length)]
                            res.send(randomTrack)

                        })
                        .catch((error) => {
                            console.log(error)
                        })
                    }
                })
            })
            .catch(( error ) => {
                console.log( error )
            })
        }
    })
})      

module.exports = router