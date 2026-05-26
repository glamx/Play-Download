const express = require("express");
const https = require("https");

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));


// HOME
app.get("/", (req, res) => {

  res.sendFile(__dirname + "/public/index.html");

});


// PEGAR INFO DO VIDEO
app.post("/info", (req, res) => {

  const videoUrl = req.body.url;

const videoId = new URL(videoUrl).searchParams.get("v");

  const options = {
  method: 'GET',
  hostname: 'cloud-api-hub-youtube-downloader.p.rapidapi.com',
 path: `/video?id=${videoId}`,
  headers: {
    'x-rapidapi-key': process.env.RAPIDAPI_KEY,
    'x-rapidapi-host':
    'cloud-api-hub-youtube-downloader.p.rapidapi.com',
    'Content-Type': 'application/json'
  }
};

  const apiReq = https.request(options, function (apiRes) {

    const chunks = [];

    apiRes.on("data", function (chunk) {
      chunks.push(chunk);
    });

    apiRes.on("end", function () {

      const body = Buffer.concat(chunks);

      const data = JSON.parse(body.toString());

      res.json({

        title: data.title,

        thumbnail: data.thumbnail,

        channel: data.author,

        duration: data.lengthSeconds

      });

    });

  });

  apiReq.end();

});


// CONVERTER
app.get("/convert", (req, res) => {

  const videoUrl = req.query.url;

  const videoId = new URL(videoUrl).searchParams.get("v");

  const options = {
    method: "GET",
    hostname: "youtube-mp36.p.rapidapi.com",
    path: `/dl?id=${videoId}`,
    headers: {
      "x-rapidapi-key": process.env.RAPIDAPI_KEY,
      "x-rapidapi-host": "youtube-mp36.p.rapidapi.com"
    }
  };

  const apiReq = https.request(options, function (apiRes) {

    const chunks = [];

    apiRes.on("data", function (chunk) {
      chunks.push(chunk);
    });

    apiRes.on("end", function () {

      const body = Buffer.concat(chunks);

      const data = JSON.parse(body.toString());

      console.log(data);

      if (!data.link) {

        return res.status(500).json({
          error: "Erro ao converter"
        });

      }

      res.redirect(data.link);

    });

  });

  apiReq.end();

});


app.listen(PORT, () => {
  console.log("Servidor rodando");
});
