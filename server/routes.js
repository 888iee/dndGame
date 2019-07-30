module.exports = (app, path, express) => {

    app.use(express.static("client"));

    app.get("/", (req, res) => {
        // res.sendFile(path.join(__dirname, "../client/play.html"));
        // res.sendFile(path.join(__dirname, "../client/index.html"));
        res.sendFile(path.join(__dirname, "../client/landing.html"));

    })
    // ajax Map Request for Client
    app.get("/map", (req, res) => {
        let json = require("./lib/map");
        // let mapData = JSON.stringify(json)
        // console.log(mapData);
        res.json(json);
    });
    // ajax character Request for Client
    app.get("/chars", (req, res) => {
        let json = require("./lib/characters");
        let x = JSON.stringify(json);
        res.json(x)
    });


    // custom Fonts
    app.get("/styles/fonts/Asap-SemiBold.tff", (req, res) => {
        res.sendFile(path.join(__dirname, "../..//client/fonts/Asap-SemiBold.tff"));
    });
    app.get("/styles/fonts/DevinneSwash.ttf", (req, res) => {
        res.sendFile(path.join(__dirname, "../..//client/fonts/DevinneSwash.ttf"));
    });

}