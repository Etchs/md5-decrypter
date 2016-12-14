var md5 = require('md5');

module.exports = {
	initialize: function(anagramWords, wordLengths, candidateWords) {
		anagramWords.forEach(function(anagramWord) {
			if (wordLengths.indexOf(anagramWord.length) === -1) {
				wordLengths.push(anagramWord.length);
				candidateWords[anagramWord.length] = [];
			}
		});
	},

	regexGenerator: function(anagramChars) {
		var uniqueChars = unique(anagramChars);
		var regexString = '^';
		uniqueChars.forEach(function(c) {
			var n = anagramChars.split(c).length; // 1 + Number of times this character is repeated in the anagram
			regexString += '(?!(?:([^' + c + ']*)+' + c + '){' + n + '})';
		});
		regexString += '[' + uniqueChars + ']+$';
		return new RegExp(regexString);
	},

	decrypt: function(phraseWords, anagramWords, candidateWords, md5Hash) {
		var wordOrderInPhrase = phraseWords.length;
		var wordLength = anagramWords[wordOrderInPhrase].length;
		var self = this;
		candidateWords[wordLength].forEach(function(candidateWord, i) {
			phraseWords.push(candidateWord);
			if (wordOrderInPhrase === anagramWords.length - 1) {
				var phrase = phraseWords.join(' ');
				if (md5Hash === md5(phrase)) {
					console.log('\nMatch Found! The decrypted phrase is: ', phrase);
					process.exit(0);
				}
			} else {
				self.decrypt(phraseWords, anagramWords, candidateWords, md5Hash);
			}
			phraseWords.pop();
			if (wordOrderInPhrase === 0) {
				showProgress(100 * (i + 1) / candidateWords[wordLength].length);
			}
		});
	}
};

var unique = function(anagramChars) {
	var obj = {};
	var uniqueChars = [];
	for (var i = 0; i < anagramChars.length; i++) {
		if (obj.hasOwnProperty(anagramChars[i])) {
			continue;
		}
		obj[anagramChars[i]] = true;
		uniqueChars.push(anagramChars[i]);
	}
	return uniqueChars;
};

var showProgress = function(percent) {
	process.stdout.clearLine();
	process.stdout.cursorTo(0);
	process.stdout.write('Tested ' + percent.toFixed(2) + '% of All Candidate Phrases');
	if (percent === 100) {
		process.stdout.write('\nNo Match Found!');
	}
};