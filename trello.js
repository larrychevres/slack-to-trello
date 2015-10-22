var Trello = require("node-trello");
var Promise = require("bluebird");

// TODO: migrate to node env or config
var trelloOrg = '53681190ac6ebd2c533b02d5';

var  api = Promise.promisifyAll(new Trello(process.env.TRELLO_KEY, process.env.TRELLO_TOKEN));

module.exports = {
	get: function (url) { 
		return api.getAsync(url);
	},
	getBoards: function(query) {
		return api.getAsync('/1/search/?modelTypes=boards&' + query);
	},
	createBoard: function(name) { 
		return api.postAsync("/1/boards?name=" + name + "&idOrganization=" + trelloOrg + "&prefs_permissionLevel=org");
	},
	getLists: function(boardId) {
		return api.getAsync('/1/boards/' + boardId + '/lists')
	},
	createList: function(name, boardId) { 
		return api.postAsync('/1/lists?name=' + name + "&idBoard=" + boardId);
	},
	checkCard: function(boardId, todoId) {
		return api.getAsync('/1/search/?modelTypes=cards&idBoards=' + boardId + '&query=' + todoId);
	},
	createCard: function(listId, name, desc, due, url) {
		console.log("URL: " + '/1/cards?idList='+listId+'&name='+name+'&desc='+desc+'&urlSource='+url+'&due='+due)	
		return api.postAsync('/1/cards?idList='+listId+'&name='+name+'&desc='+desc+'&urlSource='+url+'&due='+due)
	},
	updateCard: function(cardId, name) {
		return api.putAsync('/1/cards/'+ cardId + '?name=' + name);
	},
	getBoardCards: function(boardId) {
		return api.getAsync('/1/boards/' + boardId +'/cards');	
	},
	getCards: function(listId) { 
		console.log("GEETTING LIST " + listId)
		return api.getAsync('/1/lists/' + listId + '/cards');
	}
};
