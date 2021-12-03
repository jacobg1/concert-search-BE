const express = require("express"),
  router = express.Router(),
  axios = require("axios"),
  chunkObject = require("./utils/chunkObject");

const concertListMock = require("../mocks/concertListMockResponse.json");

router.get("/meta/:artistName/:artistYear?", function (req, res, next) {
  // take in and format search params, year is optional so
  // only add year if it exists as part of search
  const artist = req.params.artistName.replace(/ /g, "+");
  const year = req.params.artistYear || "";
  const searchParams = year ? `${artist}+AND+year%3A${year}` : artist;

  // build meta search url, this will return ids
  // for use in metadata search
  const url =
    "https://archive.org/advancedsearch.php?q=creator%3A" +
    searchParams +
    "&fl%5B%5D=identifier&fl%5B%5D=mediatype&fl%5B%5D=title&&fl%5B%5D=description&fl%5B%5D=year&sort%5B%5D=year+asc&sort%5B%5D=&sort%5B%5D=&rows=1000&page=&output=json";

  console.log("fetching from api");
  res.send(concertListMock);
  // make api call to get ids
  // axios({
  //   method: "GET",
  //   url: url,
  //   dataType: "jsonp",
  // })
  //   .then((response) => {
  //     // filter results for concert
  //     const concertsOnly = response.data.response.docs.filter((concert) => {
  //       return concert.mediatype === "etree";
  //     });

  //     // send result
  //     res.send(chunkObject(concertsOnly, 15));
  //   })
  //   .catch((error) => {
  //     console.log(error);
  //   });
});

module.exports = router;
