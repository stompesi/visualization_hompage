const express = require('express');
const path = require("path");
const app = express();
const port = process.env.PORT || 3000;

const controller = require('./controllers/index');
const apiController = require('./controllers/api/index');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, '/public')));

app.use(controller.router);
app.use('/api', apiController.router);

app.listen(port, function () {
  console.log(`App listening on port ${port}`);
});


var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'gkswhdqls',
  database : 'visualization'
});

connection.connect();

connection.query('SELECT * FROM MINER_PER_BLOCK LIMIT 1;', function (error, results, fields) {
  if (error) throw error;
  console.log('The solution is: ', results);
});

connection.end();