const express = require('express');
const path = require('path');
const api = require('./routes/api');

const app = express();
const port = process.env.PORT || 3000;


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'frontend', 'dist')));
app.use('/api', api);



app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'dist', 'index.html'));
})

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});


