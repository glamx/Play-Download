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

  const videoId = new URL(videoUrl)
    .searchParams.get("v");

  if (!videoId) {

    return res.status(400).json({
      error: "URL inválida"
    });

  }

  const thumbnail =
  `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

  res.json({

    thumbnail: thumbnail

  });

});


// CONVERTER
app.get("/convert", async (req, res) => {

  const videoUrl = req.query.url;

  const videoId = new URL(videoUrl).searchParams.get("v");

  const options = {
    method: "GET",
    hostname: "youtube-mp36.p.rapidapi.com",
    headers: {
      "x-rapidapi-key": process.env.RAPIDAPI_KEY,
      "x-rapidapi-host": "youtube-mp36.p.rapidapi.com"
    }
  };

  function requestApi() {

    return new Promise((resolve, reject) => {

      options.path = `/dl?id=${videoId}`;

      const apiReq = https.request(options, function (apiRes) {

        const chunks = [];

        apiRes.on("data", function (chunk) {
          chunks.push(chunk);
        });

        apiRes.on("end", function () {

          const body = Buffer.concat(chunks);

          try {

            const data = JSON.parse(body.toString());

            resolve(data);

          } catch (err) {

            reject(err);

          }

        });

      });

      apiReq.on("error", reject);

      apiReq.end();

    });

  }

  try {

    let data;

    for (let i = 0; i < 10; i++) {

      data = await requestApi();

      console.log(data);

      if (data.link) {

        return res.redirect(data.link);

      }

      await new Promise(resolve =>
        setTimeout(resolve, 3000)
      );

    }

    res.status(500).json({
      error: "Conversão demorou demais"
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      error: "Erro ao converter"
    });

  }

});








app.listen(PORT, () => {
  console.log("Servidor rodando");
});
