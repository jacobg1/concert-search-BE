const express = require('express'),
	router = express.Router(),
	axios = require('axios')


router.get('/random/:artistName/:artistYear?', function (req, res, next) {

	// take in and format search params, year is optional so
	// only add year if it exists as part of search
	let artist = req.params.artistName.replace(/ /g, '+')
	let year = req.params.artistYear || ''
	let searchParams = artist
	if (year) searchParams += '+AND+year%3A' + year

	// build meta search url, this will return ids
	// for use in metadata search
	let url = 'https://archive.org/advancedsearch.php?q=creator%3A' + searchParams + '&fl%5B%5D=identifier&fl%5B%5D=mediatype&fl%5B%5D=title&&fl%5B%5D=description&fl%5B%5D=year&sort%5B%5D=year+asc&sort%5B%5D=&sort%5B%5D=&rows=1000&page=&output=json'

	// make api call to get ids
	axios({
			method: 'GET',
			url: url,
			dataType: 'jsonp',
		})
		.then((response) => {

			// get random concert
			let responseData = response.data.response.docs
			let randomConcert = responseData[Math.floor(Math.random() * responseData.length)].identifier
			// let randomConcert = 'gd1969-02-28.139196.sbd.2track.Gastwirt.Miller.Noel.t-flac16'

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
					let {
						d1,
						dir
					} = response.data
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

					// send result to front end
					let {
						trackList
					} = concertObject
					let randomTrack = trackList[Math.floor(Math.random() * trackList.length)]

					// send random track
					res.send(randomTrack)

				})
				.catch((error) => {
					console.log(error)
				})
		})
})

module.exports = router