Pebble.addEventListener("ready", function(e) {
	if(localstorage.github_token){
		//do github api stuff here
	}
});

Pebble.addEventListener("showConfiguration", function(e){
	var callback_uri = "";

	if(callback_uri){
		Pebble.openURL("");
	}else{
		Pebble.showSimpleNotificationOnPebble("Octokitty", "Invalid authorization url");
	}
});


