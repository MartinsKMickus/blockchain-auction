const express = require('express');
const app = express();
const port = 3000;
app.use(express.static('src'));
// Include compiled contract itself
app.use(express.static('../auction-contract/build/contracts'));

app.get('/', (req, res) => {
    res.render('index.html');
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});