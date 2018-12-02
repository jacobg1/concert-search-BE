const express = require('express'),
      router = express.Router(),
      axios = require('axios')

router.get('/meta/:artistName/:artistYear?', function (req, res, next) {
    
    // take in and format search params, year is optional so
    // only add year if it exists as part of search
    let artist = req.params.artistName.replace(/ /g, '+')
    let year = req.params.artistYear || ''
    let searchParams = artist
    if (year) searchParams += '+AND+year%3A' + year

    // build meta search url, this will return ids
    // for use in metadata search
    let url = 'https://archive.org/advancedsearch.php?q=creator%3A' + searchParams + '&fl%5B%5D=identifier&fl%5B%5D=mediatype&fl%5B%5D=title&&fl%5B%5D=description&fl%5B%5D=year&sort%5B%5D=year+asc&sort%5B%5D=&sort%5B%5D=&rows=5000&page=&output=json'
    
    // make api call to get ids
    axios({
        method: 'GET',
        url: url,
        dataType: 'jsonp',
    })
    .then((response) => {
        res.send(response.data)
    })
    .catch((error) => {
        console.log(error)
    })
   
    
})      

module.exports = router