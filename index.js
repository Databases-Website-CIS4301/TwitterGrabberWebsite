module.exports = require('./lib/oracledb.js');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var config = require('./config')

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
//app.use(bodyParser.json())
var oracledb = require('oracledb');



app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

//Functions:



// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
    //console.log("test");
    response.render('pages/index');
});

app.get('/about', function(req, res) {
    res.render('pages/about');
});
app.get('/search', function(req, res) {
    res.render('pages/search');
});

app.post('/submit', function (req, res) {
  var query = null;
  if (req.body.keywords != null) {
    var keywordsArray = req.body.keywords.split(" ");
    var arrayLength = keywordsArray.length;
    var query = "SELECT * FROM Tweet t WHERE ";
    for (var i = 0; i < arrayLength; i++) {
        if (i != 0) {
          query = query + " AND "
        }
        query = query + "LOWER(t.tweet_text) LIKE \'%" + keywordsArray[i].toLowerCase() + "%\'";
    }
     

    console.log("Keywords: " + query);
  }

    if (query != null) {
      var data = { values:"", headers:""};
    	queryOracle(query, data, res, false);
    }
});

app.post('/raw_query', function (req, res) {
    console.log("Query: " + req.body.query);

    if (req.body.query != null) {
      var data = { values:"", headers:""};
      queryOracle(req.body.query, data, res, true);
    }
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});


function queryOracle(queryString, temp, res, raw) {
  oracledb.getConnection({  
     user: config.database.user,
     password: config.database.password,
     connectString: config.database.connectString
}, function(err, connection) {  
     if (err) {  
          console.error(err.message);  
          return;  
     }  
     connection.execute(queryString,  
     [],  
     function(err, result) {  
          if (err) {  
               console.error(err.message);  
               doRelease(connection);  
               return;  
          }  
          //console.log(result.metaData);  
          //console.log(result.rows); 
          temp.headers = result.metaData;
          temp.values = result.rows;
          doRelease(connection);  
          renderSubmitPage(temp, res, raw);
     });  
});  
}

function renderSubmitPage(data, res, raw) {
      console.log(data);
      if (raw) {
      res.render('pages/dataRaw', {'data' : data.values, 'headers' : data.headers});
      } else {
      res.render('pages/data', {'data' : data.values, 'headers' : data.headers});
      }
}
function doRelease(connection) {  
     connection.release(  
          function(err) {  
               if (err) {console.error(err.message);}  
          }  
     );  
}  