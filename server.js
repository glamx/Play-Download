const express = require("express");
const { exec } = require("child_process");
const fs = require("fs");

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

  const url = req.body.url;

const command = `yt-dlp --dump-json "${url}"`;

  exec(command, (error, stdout) => {

    if (error) {

      console.log(error);

      return res.status(500).json({
        error: "Erro ao buscar vídeo"
      });

    }

    const data = JSON.parse(stdout);

    res.json({

      title: data.title,

      thumbnail: data.thumbnail,

      channel: data.uploader,

      duration: data.duration_string

    });

  });

});


// CONVERTER
app.get("/convert", (req, res) => {

  const url = req.query.url;

  const fileName = `audio-${Date.now()}.mp3`;

  const outputPath = `downloads/${fileName}`;

 const command = `
yt-dlp
--user-agent "Mozilla/5.0"
--extract-audio
--audio-format mp3
--no-playlist
-o "${outputPath}"
"${url}"
`;

  exec(command, (error) => {

    if (error) {

      console.log(error);

      return res.status(500).send("Erro");

    }

    res.download(outputPath, "audio.mp3", () => {

      fs.unlinkSync(outputPath);

    });

  });

});


app.listen(PORT, () => {
  console.log("Servidor rodando");
});
