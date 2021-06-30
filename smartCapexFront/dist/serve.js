const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors')


const PORT = 8901;

const STATIC = path.resolve(__dirname, 'spa');
const INDEX = path.resolve(STATIC, 'index.html');


const app = express();
app.use(bodyParser.json());

//SET CORS
app.use(cors())

// Static content
app.use(express.static(STATIC));

// All GET request handled by INDEX file
app.get('*', function (req, res) {
  res.sendFile(INDEX);
});

// Start server
app.listen(PORT, function () {
  console.log('Server up and running on ', `http://localhost:${PORT}/`);
});
