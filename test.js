
  


var lineReader = require('readline').createInterface({
	input: require('fs').createReadStream('./wordlist')
});
var regex = /[a-z]/;
var lookouts = [];
var chars = [];
lineReader.on('line', function(word) {
	var numOfSymb = 0;
	for (var i = 0; i < word.length; i++) {
		if (!regex.test(word[i])) {
			if(word[i]==='\'') {
				numOfSymb++;
			}
			if (chars.indexOf(word[i]) === -1) {
				chars.push(word[i]);
			}
		}
	}
	if(numOfSymb>1){
		lookouts.push(word);
	}
});

lineReader.on('close', function() {
	console.log('chars: ', chars);
	console.log('lookouts: ', lookouts);
});