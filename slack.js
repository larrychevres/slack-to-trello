// utilities for sending messages to slack

// curl -X POST --data-urlencode 'payload={"channel": "#webproblems", "username": "webhookbot", "text": "This is posted to #webproblems and comes from a bot named webhookbot.", "icon_emoji": ":ghost:"}' https://hooks.slack.com/services/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

module.exports = {
	
	buildWebhookPayload : function(channel, username, msg, icon) {
		var payload = { 
			text : msg,
			channel : channel,
			username : username
		}

		if (icon) { 
			payload['icon_emoji'] = icon;
		}

		return payload;
	}
}