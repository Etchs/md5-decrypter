var utilities = require('./utilities');

module.exports = function(md5Hash, anagram, wordlistPath) {
	var anagramWords = anagram.split(' ');
	var wordLengths = [];
	var candidateWords = {};
	utilities.initialize(anagramWords, wordLengths, candidateWords);
	var regex = utilities.regexGenerator(anagram.replace(/ /g, ''));

	var lineReader = require('readline').createInterface({
		input: require('fs').createReadStream(wordlistPath)
	});

	lineReader.on('line', function(word) {
		if (wordLengths.includes(word.length) && word.match(regex)) {
			candidateWords[word.length].push(word);
		}
	});

	lineReader.on('close', function() {
		utilities.decrypt([], anagramWords, candidateWords, md5Hash);
	});
};
