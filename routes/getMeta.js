const express = require('express'),
      router = express.Router(),
      axios = require('axios')
      redis = require('redis'),
      client = redis.createClient()

    // handle redis errors
    client.on('error', function ( err ) {
        console.log('Error ' + err);
    });


router.get('/meta/:artistName/:artistYear?', function (req, res, next) {
    
    // take in and format search params, year is optional so
    // only add year if it exists as part of search
    let artist = req.params.artistName.replace(/ /g, '+')
    let year = req.params.artistYear || ''
    let searchParams = artist
    if (year) searchParams += '+AND+year%3A' + year

    // build meta search url, this will return ids
    // for use in metadata search
    let url = 'https://archive.org/advancedsearch.php?q=creator%3A' + searchParams + '&fl%5B%5D=identifier&fl%5B%5D=mediatype&fl%5B%5D=title&&fl%5B%5D=description&fl%5B%5D=year&sort%5B%5D=year+asc&sort%5B%5D=&sort%5B%5D=&rows=1000&page=&output=json'
    
    // check if exists in redis storage
    client.exists( searchParams, function ( err, reply ) {

        // exists() returns 1 if exists
        if ( reply === 1 ) {

            console.log('fetching from redis store')

            // get result from redis instead of making api call
            client.get( searchParams, function ( error, result ) {

                // handle errors
                if ( error ) throw error

                    // send result
                    res.send(JSON.parse( result ))
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
                client.set(searchParams, JSON.stringify( concertsOnly ))
                
                // send result
                res.send( concertsOnly )
            })
            .catch(( error ) => {
                console.log( error )
            })
        }
    })
})      

module.exports = router