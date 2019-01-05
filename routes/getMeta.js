const express = require('express'),
      router = express.Router(),
      axios = require('axios')
      redis = require('redis'),
      chunkObject = require('./utils/chunkObject')

var rtg = require("url").parse('redis://h:p5abe63fe831a9a701b6199741a9078488e14f06ec3c1f651dbe8eef30d4456b3@ec2-54-158-129-107.compute-1.amazonaws.com:40909');
var redis = require("redis").createClient(rtg.port, rtg.hostname);

redis.auth(rtg.auth.split(":")[1]);
    // handle redis errors
    client.on('error', function ( err ) {
        console.log('Error ' + err);
    });


router.get('/meta/:artistName/:artistYear?', function (req, res, next) {
    
    // take in and format search params, note that
    // year is never added to the api call, however it will be used to filter 
    // the results by year
    let artist = req.params.artistName.replace(/ /g, '+')
    let year = req.params.artistYear || ''
    let searchParams = artist
    // if (year) searchParams += '+AND+year%3A' + year

    // build meta search url, this will return ids
    // for use in metadata search
    let url = 'https://archive.org/advancedsearch.php?q=creator%3A' + searchParams + '&fl%5B%5D=identifier&fl%5B%5D=mediatype&fl%5B%5D=title&&fl%5B%5D=description&fl%5B%5D=year&sort%5B%5D=year+asc&sort%5B%5D=&sort%5B%5D=&rows=20000&page=&output=json'
    
    // check if exists in redis storage
    client.exists( artist, function ( err, reply ) {

        // exists() returns 1 if exists
        if ( reply === 1 ) {

            console.log('fetching from redis store')

            // get result from redis instead of making api call
            client.get( artist, function ( error, result ) {

                // decode result from JSON so that it can be manipulated
                let parseResult = JSON.parse( result )

                // handle errors
                if ( error ) throw error

                    // if year exists in params, filter by year param
                    if( year ) {

                        let filterByYear = parseResult.filter(( item ) => {
                            return item.year === year
                        })

                        // Split in group of 10 items
                        let chunkResult = chunkObject( filterByYear, 25 )

                        // send year filtered result
                        res.send( chunkResult )

                    } else {
                        
                        // Split in group of 50 items
                        let chunkResult = chunkObject( parseResult, 25 )
                        
                        // send result
                        res.send( chunkResult )
                    }
            })

        } else {

            console.log('fetching from api')

            // make api call to get ids
            axios({
                method: 'GET',
                url: url,
                dataType: 'jsonp',
            })
            .then(( response ) => {

                // filter results for concert
                let concertsOnly = response.data.response.docs.filter(( concert ) => {
                    return concert.mediatype === 'etree' 
                })

                // set hash in redis storage
                client.set(artist, JSON.stringify(concertsOnly))

                // if year exists in params, filter by year param
                if ( year ) {
                    
                    let filterByYear = concertsOnly.filter(( item ) => {
                        return item.year === year
                    })

                    // send year filtered result
                    res.send( filterByYear )

                } else {
                    console.log(concertsOnly.length)
                    // send result
                    res.send( concertsOnly )
                }
            })
            .catch(( error ) => {
                console.log( error )
            })
        }
    })
})      

module.exports = router