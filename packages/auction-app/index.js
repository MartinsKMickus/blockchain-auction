const express = require('express');
const fs = require('fs');
const app = express();
const port = 3000;
app.use(express.static('src'));
app.use(express.static('src/images'));
app.use(express.static('data'));
// Include compiled contract itself
app.use(express.static('../auction-contract/build/contracts'));

app.get('/', (req, res) => {
    res.render('index.html');
});

app.use(express.json()); // To be able to parse req as JSON
app.post('/registrateAuction', (req, res) => {
    const jsonData = req.body;
    console.log('Received JSON data:', jsonData);
    const jsonString = JSON.stringify(jsonData, null, 2);
    if (!fs.existsSync("data")) {
        fs.mkdirSync("data");
    }
    fs.writeFileSync('data/auctionAddress.json', jsonString);
    res.json({ message: 'Auction address saved successfully!' });
});

const multer = require('multer');
const upload = multer();
app.post('/addItem', upload.single('file'), (req, res) => {
    const fileBuffer = req.file.buffer;
    const jsonData = JSON.parse(req.body.JSON);
    console.log('Received JSON data:', jsonData);
    if (!fs.existsSync("data")) {
        fs.mkdirSync("data");
    }
    if (fs.existsSync("data/items.json")) {
        const existingData = fs.readFileSync('data/items.json', 'utf-8');
        var existingjsonData = JSON.parse(existingData);
    } else {
        var existingjsonData = [];
    }
    existingjsonData.push(jsonData);
    const jsonString = JSON.stringify(existingjsonData, null, 2);
    fs.writeFileSync('data/items.json', jsonString);
    fs.writeFileSync(`data/${jsonData.picture}`, fileBuffer);
    res.json({ message: 'Items saved successfully!' });
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});