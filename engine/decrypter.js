var utilities = require('./utilities');
var _ = require('lodash');


module.exports = function(md5Hash, anagram, wordlistPath) {
	console.log(new Date());
	console.log(md5Hash);
	console.log(typeof md5Hash);
	var anagramWords = anagram.split(' ');
	var anagramChars = anagram.replace(/ /g, '');
	var wordLengths = [];
	var candidateWords = {};
	var allCandidateWords = [];
	// utilities.initialize(anagramWords, wordLengths, candidateWords);
	var regex = utilities.initialize(anagramChars, md5Hash);


	var lineReader = require('readline').createInterface({
		input: require('fs').createReadStream(wordlistPath)
	});

	lineReader.on('line', function(lineWord) {
		var word = lineWord;
		if(lineWord.indexOf('\'')>-1){
			word = lineWord.replace(/'/g, '');
		}
		// if (wordLengths.includes(word.length) && word.match(regex)) {
		if (word.length <= anagramChars.length && regex.test(word)) {
			utilities.pushToCandidateWords(lineWord);
			utilities.pushToAllCandidateWords(lineWord);
		}
	});

	lineReader.on('close', function() {
		utilities.decrypt();
		console.log('done!');
	});
};