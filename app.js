var express = require('express');
var bodyParser = require('body-parser');
var Trello = require('node-trello');
var trello = require('./trello.js')
var request = require('request')
var slack = require('./slack.js')
var Promise = require("bluebird");

var app = express();
var port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));

// generic web client
// common options:
// uri, method, headers {}, json (sets body and content type)
var send = Promise.promisify(function(options, cb) {
  request(options, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      if (typeof body == 'string') {
          try {
            body = JSON.parse(body);
          } catch(e) {}
      }
      cb(null,body);
    } else {
      cb(error, null);
    }
  });
});

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
      var msg = data.map(function(card) { return card.name + ' <https://trello.com/c/' + card.shortLink + '/>' + '\n'; })
      msg = msg.join(' ');
      var payload = slack.buildWebhookPayload('#webproblems', 'trellobot', msg, ':trello:')
      var webhookUrl = 'https://hooks.slack.com/services/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';

      send({ 
        url: webhookUrl,
        method: 'POST',
        json : payload
      })

      // tell slack we're all good, silently
      res.status(200).send();
    } else {
      // TODO: convert this msg to webhook
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
