const express = require('express');
const cors = require('cors');
const path = require('path');
const port = 3001;

const server = express();

server.use(cors());
server.use(express.json())
server.use(express.urlencoded({ extended: false }))

server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

module.exports = server;
