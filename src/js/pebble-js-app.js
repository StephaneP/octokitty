var kitty = {
	appMessageQueue: [],
	appMessageRetryTimeout: 3000,
	appMessageTimeout: 100,
	repositories: {},
	max_repositories: 20
};

Pebble.addEventListener("ready", function(e) {
	if(localStorage.github_token){
		getUserAccountInfo();
	}
});

Pebble.addEventListener("showConfiguration", function(e){
	Pebble.openURL("https://github.com/login/oauth/authorize?client_id=6d2d277b89edf51f76ca");
});

Pebble.addEventListener("webViewClosed", function(e){
	var result = JSON.parse(e.response);

	if( result.success == true ){
		localStorage.github_token = result.token;
		notifyPebbleConnected(resul.token.toString());
		// get repositories
		// get issues
		// get notifications
	}else{
		Pebble.showSimpleNotificationOnPebble("Octokitty", "Connection Failed. Try Again.");
	}
});

var notifyPebbleConnected = function(result, message){
	var _appMessage = {
		'result': ( result == true ) ? 1 : 0,
		'name': message
	};

	var _success = function(e){
		console.log('Successfully delivered token message with transactionId=' + e.data.transactionId);
	};

	var _error = function(e){
		console.log('Unable to deliver token message with transactionId=' + e.data.transactionId);
	};

	var transactionId = Pebble.sendAppMessage(_appMessage, success, error);
};

var getUserAccountInfo = function(){

};