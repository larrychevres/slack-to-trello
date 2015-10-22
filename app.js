var express = require('express');
var bodyParser = require('body-parser');
var Trello = require('node-trello');
//var trello = new Trello(process.env.TRELLO_KEY, process.env.TRELLO_TOKEN);
var trello = require('./trello.js')

//"dd936039c7fee8d9fa7bf201ea9d74c7", 
//  "fc143bcd1d7f4dea74dddaca0e99692d14898dc6780aee043b3658d22f742ac2"));

var app = express();
var port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));

function postToTrello(listId, command, text, user_name, cb) {
  if (text == undefined || text == null || text == "") {
    throw new Error('Format is ' + command + ' name | description(optional)');
  }

  var name_and_desc = text.split('|');

	var card_data = {
		'name' : name_and_desc.shift() + ' (@' + user_name + ')',
		'desc' : name_and_desc.shift()
	};

  trello.createCard(listId, card_data.name, card_data.desc)
  .then(function(data) {
    cb(null,data);
  });
	//trello.post('/1/lists/' + listId + '/cards', card_data, cb);
}

app.post('/*', function(req, res, next) {
  var listId = req.params[0];
  var command = req.body.command,
  text = req.body.text,
  user_name = req.body.user_name;

  postToTrello(listId, command, text, user_name, function(err, data) {
    if (err) throw err;
    console.log(data);

    var name = data.name;
    var url = data.shortUrl;

    res.status(200).send('Card "' + name + '" created here: <' + url + '>');
  });
});

// test route
app.get('/issues/*', function (req, res) {
  var listId = req.params[0];
  
  trello.getCards(listId)
  .then(function(data) {
    if (data) {
      var msg = data.map(function(card) { return card.name + ' [trello](https://trello.com/c/' + card.shortLink + '/)' + '\n'; })
      res.status(200).send('Issues: \n' + msg);
    } else {
      res.satus(200).send('No open issues found.');
    }
  })
});

// test route
app.get('/', function (req, res) { res.status(200).send('SupportKit.io loves Slack and Trello!') });

// error handler
app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(400).send('Error: ' + err.message);
});

app.listen(port, function () {
  console.log('Started Slack-To-Trello ' + port);
});
