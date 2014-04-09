var kitty = {
	appMessageQueue: [],
	appMessageRetryTimeout: 3000,
	appMessageTimeout: 100,
	repositories: {},
	max_repositories: 20
};

Pebble.addEventListener("ready", function(e) {
	if(localStorage.github_token){
		console.log('token exists ' + localStorage.github_token);
		getUserAccountInfo();
	}
});

Pebble.addEventListener("showConfiguration", function(e){
	Pebble.openURL("http://Octokitty.herokuapp.com/auth/github");
});

Pebble.addEventListener("webviewclosed", function(e){
	var result = JSON.parse(e.response);

	console.log(result.token);

	if( result.success == true ){
		localStorage.github_token = result.token;
		notifyPebbleConnected(result.token.toString());
		getUserAccountInfo();		
	}else{
		Pebble.showSimpleNotificationOnPebble("Octokitty", "Connection Failed. Try Again.");
	}
});

var notifyPebbleConnected = function(result, message){
	var _appMessage = {
		'result': ( result == true ) ? 1 : 0,
		'name': message
	};

	var transactionId = Pebble.sendAppMessage( _appMessage,
	  function(e) {
	    console.log("Successfully delivered message with transactionId="
	      + e.data.transactionId);
	  },
	  function(e) {
	    console.log("Unable to deliver message with transactionId="
	      + e.data.transactionId
	      + " Error is: " + e.error.message);
	  }
	);
};

var getUserAccountInfo = function(){

};

Pebble.addEventListener('appmessage',
	function(e) {
		appMessageQueue = [];

		console.log('Received message: ' + e.payload.toString());
		if (e.payload.refresh) {
			getUserAccountInfo();
		}
	}
);

var sendAppMessage = function (){
	if (appMessageQueue.length > 0) {
		currentAppMessage = appMessageQueue[0];
		currentAppMessage.numTries = currentAppMessage.numTries || 0;
		currentAppMessage.transactionId = currentAppMessage.transactionId || -1;
		if (currentAppMessage.numTries < maxAppMessageTries) {
			console.log('Sending AppMessage to Pebble: ' + JSON.stringify(currentAppMessage.message));
			Pebble.sendAppMessage(
				currentAppMessage.message,
				function(e) {
					appMessageQueue.shift();
					setTimeout(function() {
						sendAppMessage();
					}, appMessageTimeout);
				}, function(e) {
					console.log('Failed sending AppMessage for transactionId:' + e.data.transactionId + '. Error: ' + e.data.error.message);
					appMessageQueue[0].transactionId = e.data.transactionId;
					appMessageQueue[0].numTries++;
					setTimeout(function() {
						sendAppMessage();
					}, appMessageRetryTimeout);
				}
			);
		} else {
			console.log('Failed sending AppMessage for transactionId:' + currentAppMessage.transactionId + '. Bailing. ' + JSON.stringify(currentAppMessage.message));
		}
	}
}