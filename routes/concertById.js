const express = require("express"),
  router = express.Router(),
  axios = require("axios");

const individualConcertMock = require("../mocks/individualConcertMocks.json");

router.get("/concert/:id", function (req, res, next) {
  // take in id parameter
  let concertId = req.params.id;

  // build search url
  let url = "https://archive.org/metadata/" + concertId;

  console.log("fetching from api");
  res.send(individualConcertMock);
  // make api call
  // axios({
  //   method: "GET",
  //   url: url,
  //   dataType: "jsonp",
  // })
  //   .then((response) => {
  //     // build playback url base
  //     let { d1, dir } = response.data;
  //     let base = "https://" + d1 + dir + "/";

  //     // filter results for correct audio format
  //     let mp3Tracks = response.data.files.filter(function (song) {
  //       return song.format === "VBR MP3";
  //     });

  //     // add the built play url as an object key
  //     mp3Tracks.forEach((track) => {
  //       track.playUrl = base + track.name.replace(/ /g, "%20");
  //     });

  //     // build response object
  //     let concertObject = {};

  //     // add metadata
  //     concertObject.metaData = response.data.metadata;

  //     // add track list
  //     concertObject.trackList = mp3Tracks;

  //     // TODO: filter out concerts with no tracks
  //     // send result to front end
  //     // res.send(concertObject)
  //     res.send(individualConcertMock);
  //   })
  //   .catch((error) => {
  //     console.log(error);
  //   });
});

module.exports = router;
