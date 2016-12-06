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
  //Tweet search:

    console.log(req.body.type_drop);
  if (req.body.type_drop == "tweets") {
    tweetQuery(req, res);
  } else {
    userQuery(req, res);
  }
  
});

app.post('/raw_query', function (req, res) {
    console.log("Query: " + req.body.query);

    if (req.body.query != null) {
      var data = { values:"", headers:""};
      queryOracle(req.body.query, data, res, true, false);
    }
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

function tweetQuery(req, res) {
  var query = null;
  //This variable is for seeing if we need to append our first select statement.
  var exists = false;
  var query = "SELECT * from TWITTERUSER tu join TWEET t on tu.user_id = sender_id WHERE ";
  if (req.body.keywords != "") {
    if (exists) {
      query = query + "AND "
    } else {
      exists = true;
    }

    var keywordsArray = req.body.keywords.split(" ");
    var arrayLength = keywordsArray.length;
    for (var i = 0; i < arrayLength; i++) {
        if (i != 0) {
          query = query + " AND "
        }
        query = query + "LOWER(t.tweet_text) LIKE \'%" + keywordsArray[i].toLowerCase() + "%\'";
    }
     

    console.log("Keywords: " + query);
  }

  //Check if the username contains the following string field
  if (req.body.username != "") {
    if (exists) {
      query = query + "AND "
    } else {
      exists = true;
    }

    var username = req.body.username.toLowerCase();
    query = query + "LOWER(tu.name) LIKE \'%" + username + "%\'";

    console.log("Username found: " + req.body.username);
  }

  //Retweets field:
  if (req.body.retweets != "") {
    if (exists) {
      query = query + "AND "
    } else {
      exists = true;
    }

    var query_equality = ">";

    if (req.body.retweetequality == "less-than") {
      query_equality = "<";
    }

    if (req.body.retweetequality == "equal-to") {
      query_equality = "=";
    }

    query = query + "t.retweet_count " + query_equality + " " + req.body.retweets + " ";
    console.log("Retweets found: " + req.body.retweets);
  }

  //favorites field:
  if (req.body.favorites != "") {
    if (exists) {
      query = query + "AND "
    } else {
      exists = true;
    }

    var query_equality = ">";

    if (req.body.favoriteequality == "less-than") {
      query_equality = "<";
    }

    if (req.body.favoriteequality == "equal-to") {
      query_equality = "=";
    }

    query = query + "t.favorite_count " + query_equality + " " + req.body.favorites + " ";
    console.log("Favorites found: " + req.body.favorites);
  }

  //Check if the region contains the following string field
  if (req.body.region != "") {
    if (exists) {
      query = query + "AND "
    } else {
      exists = true;
    }

    var region = req.body.region.toLowerCase();
    query = query + "LOWER(t.place) LIKE \'%" + region + "%\'";

    console.log("Region found: " + req.body.region);
  }

  //languages field:
  if (req.body.languagetypes != "any") {
    if (exists) {
      query = query + "AND "
    } else {
      exists = true;
    }

    var language = "";

    if (req.body.languagetypes == "english") {
      language = "en";
    }
    if (req.body.languagetypes == "spanish") {
      language = "es";
    }

    query = query + "t.langauge = \'" + language + "\' ";
    console.log("Language found: " + req.body.languagetypes);
  }

    if (exists) {
      var data = { values:"", headers:""};
      queryOracle(query, data, res, false, false);
    }
}

function userQuery(req, res) {
  //This variable is for seeing if we need to append our first select statement.
  var exists = false;
  var query = "SELECT * from TWITTERUSER tu join TWEET t on tu.user_id = sender_id WHERE ";

  //Check if the username contains the following string field
  if (req.body.username_users != "") {
    if (exists) {
      query = query + "AND "
    } else {
      exists = true;
    }

    var username = req.body.username_users.toLowerCase();
    query = query + "LOWER(tu.name) LIKE \'%" + username + "%\'";

    console.log("Username found: " + req.body.username_users);
  }

  //followers field:
  if (req.body.followers != "") {
    if (exists) {
      query = query + "AND "
    } else {
      exists = true;
    }

    var followersEquality = ">";

    if (req.body.followersequality == "less-than") {
      followersEquality = "<";
    }

    if (req.body.followersequality == "equal-to") {
      followersEquality = "=";
    }

    query = query + "tu.follower_count " + followersEquality + " " + req.body.followers + " ";
    console.log("Followers found: " + req.body.followers);
  }

  //Check if the region contains the following string field
  if (req.body.region_users != "") {
    if (exists) {
      query = query + "AND "
    } else {
      exists = true;
    }

    var region = req.body.region_users.toLowerCase();
    query = query + "LOWER(t.place) LIKE \'%" + region + "%\'";

    console.log("Region found: " + req.body.region_users);
  }

  //languages field:
  if (req.body.languagetypes_users != "any") {
    if (exists) {
      query = query + "AND "
    } else {
      exists = true;
    }

    var language = "";

    if (req.body.languagetypes_users == "english") {
      language = "en";
    }
    if (req.body.languagetypes_users == "spanish") {
      language = "es";
    }

    query = query + "tu.langauge = \'" + language + "\' ";
    console.log("Language found: " + req.body.languagetypes_users);
  }

    if (exists) {
      var data = { values:"", headers:""};
      queryOracle(query, data, res, false, true);
    }
}

function queryOracle(queryString, temp, res, raw, users) {
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
          renderSubmitPage(temp, res, raw, users);
     });  
});  
}

function renderSubmitPage(data, res, raw, users) {
      console.log(data);
      if (raw) {
      res.render('pages/dataRaw', {'data' : data.values, 'headers' : data.headers});
      } else {
      res.render('pages/data', {'data' : data.values, 'headers' : data.headers, 'users' : users});
      }
}
function doRelease(connection) {  
     connection.release(  
          function(err) {  
               if (err) {console.error(err.message);}  
          }  
     );  
}  