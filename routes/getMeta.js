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
    
    // take in and format search params, note that
    // year is never added to the api call, however it will be used to filter 
    // the results by year
    let artist = req.params.artistName.replace(/ /g, '+')
    let year = req.params.artistYear || ''
    let searchParams = artist
    // if (year) searchParams += '+AND+year%3A' + year

    // build meta search url, this will return ids
    // for use in metadata search
    let url = 'https://archive.org/advancedsearch.php?q=creator%3A' + searchParams + '&fl%5B%5D=identifier&fl%5B%5D=mediatype&fl%5B%5D=title&&fl%5B%5D=description&fl%5B%5D=year&sort%5B%5D=year+asc&sort%5B%5D=&sort%5B%5D=&rows=1000&page=&output=json'
    
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

                        // send year filtered result
                        res.send( filterByYear )

                    } else {
                        // send result
                        res.send( parseResult )
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