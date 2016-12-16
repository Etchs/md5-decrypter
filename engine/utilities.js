var md5 = require('md5');
var async = require('async');
var _ = require('lodash');
var candidateWordsArrays = [];
var anagramChars = '';
var anagramCharsLength;
var allCandidateWords = [];
var md5Hash;
var regex;
var percent = 0;
var latestMd5test;

module.exports = {
	initialize: function(anagramCharsString, md5Hash) {
		anagramChars = anagramCharsString;
		anagramCharsLength = anagramCharsString.length;
		md5Hash = md5Hash;
		candidateWordsArrays[0] = [];
		for (var i = 1; i <= anagramCharsLength; i++) {
			candidateWordsArrays[i] = [];
		}
		regex = this.regexGenerator(anagramCharsString);
		return regex;
	},

	initialize_old: function(anagramWords, wordLengths, candidateWords) {
		anagramWords.forEach(function(anagramWord) {
			if (wordLengths.indexOf(anagramWord.length) === -1) {
				wordLengths.push(anagramWord.length);
				candidateWords[anagramWord.length] = [];
			}
		});
	},

	pushToCandidateWords: function(word) {
		if(word.indexOf('\'')>-1){
			var wordChars = word.replace(/[']/g, '');
			candidateWordsArrays[wordChars.length].push(word);
		} else {
			candidateWordsArrays[word.length].push(word);
		}
		
	},

	pushToAllCandidateWords: function(word) {
		allCandidateWords.push(word);
	},

	regexGenerator: function(anagramChars) {
		var uniqueChars = unique(anagramChars);
		var subregex1 = '';
		var subregex2 = '';
		uniqueChars.forEach(function(c) {
			var n = anagramChars.split(c).length; // 1 + Number of times this character is repeated in the anagram
			if (n === 2) {
				subregex1 += c;
			} else if (n > 2) {
				subregex2 += '(?!(.*' + c + '){'+(n)+'})';
			}
		});
		var regexString = '^(?!.*([' + subregex1 + ']).*\\1)' + subregex2 + '[' + uniqueChars.join("") + ']*$';
		// var regexString = '^(?!.*([' + subregex1 + ']).*\\1)' + subregex2 + '[' + uniqueChars + ']*$';
		console.log(regexString);
		return new RegExp(regexString);
	},

	regexGenerator_old: function(anagramChars) {
		var uniqueChars = unique(anagramChars);
		var regexString = '^';
		uniqueChars.forEach(function(c) {
			var n = anagramChars.split(c).length; // 1 + Number of times this character is repeated in the anagram
			regexString += '(?!(?:([^' + c + ']*)+' + c + '){' + n + '})';
		});
		regexString += '[' + uniqueChars.join("") + ']+$';
		// regexString += '[' + uniqueChars + ']+$';
		console.log(regexString);
		return new RegExp(regexString);
	},

	decrypt: function() {

		// console.log('allCandidateWords.length: ', allCandidateWords.length);
		allCandidateWords = _.uniq(allCandidateWords);
		allCandidateWords.sort(function(a, b) {
			return (a.length - b.length);
		});
		console.log('allCandidateWords.length: ', allCandidateWords.length);
		for (var i = 0; i < candidateWordsArrays.length; i++) {
			// console.log('candidateWordsArrays['+i+'].length: ', candidateWordsArrays[i].length);
			candidateWordsArrays[i] = _.uniq(candidateWordsArrays[i]);
			console.log('candidateWordsArrays['+i+'].length: ', candidateWordsArrays[i].length);
		}
		// var union = _.union(candidateWordsArrays[10],candidateWordsArrays[11]);
		// candidateWordsArrays[6].sort();
		// candidateWordsArrays[7].reverse();
		// var firstHalf = candidateWordsArrays[8].slice(0,candidateWordsArrays[8].length/2);
		// var r375400 = candidateWordsArrays[6].slice(375,400);
		// above300.reverse();
		// secondHalf.reverse();
		console.log('Testing 4 word phrases that start with ALL letter words only');
		allCandidateWords.forEach(function(firstWord, i) {
			percent = 100 * (i + 1) / allCandidateWords.length;
			showMessage(i+1 + '/' + allCandidateWords.length);
			// if (i<50) { //second100>24  first100>22  first100 in 5 letter>33
				somefunc(null, firstWord);
			// }
		});
	},

	decrypt_new: function(phraseWords, anagramWordsLength, md5Hash, anagramCharsLength, regex) {
		var wordOrderInPhrase = phraseWords.length;
		// var wordLength = anagramWords[wordOrderInPhrase].length;
		var self = this;
		// console.log('anagramCharsLength: ', anagramCharsLength);

		/*phraseWords.forEach(function(phraseWord, i) {
		    allCandidateWords.splice(allCandidateWords.indexOf(phraseWord), 1);
		});*/

		/*async.eachOfSeries(allCandidateWords, function(candidateWord, i, cb) {
			
			if (phraseWords.indexOf(candidateWord)===-1) {
				phraseWords.push(candidateWord);
				var canidatePhraseChars = phraseWords.join('');
				var canidatePhraseCharsLength = canidatePhraseChars.length;
				var regexTestResult = canidatePhraseChars.match(regex);
				// since spaces are not part of anagram consider removing the condition: wordOrderInPhrase+1 === anagramWordsLength
				// while keeping anagramCharsLength === phraseWords.join('').length
				// if ( (wordOrderInPhrase+1) === anagramWordsLength && canidatePhraseCharsLength === anagramCharsLength) {
				if (regexTestResult && canidatePhraseCharsLength === anagramCharsLength) {
					var phrase = phraseWords.join(' ');
					// console.log('phraseWords: ', phraseWords);
					console.log('Testing phrase: ' + phrase);
					if (md5Hash === md5(phrase)) {
						console.log(new Date());
						console.log('\nMatch Found! The decrypted phrase for the MD5 hash "' + md5Hash + '" is: ', phrase);
						cb('Exiting!');
						// process.exit(0);
					} else {
						phraseWords.pop();
						cb();
					}
				} else if ( regexTestResult && canidatePhraseCharsLength <= anagramCharsLength) {
					// var phraseWordsBkp = phraseWords;
					setTimeout(function(pws) {
						console.log('pws', pws);
						self.decrypt(pws, anagramWordsLength, md5Hash, anagramCharsLength, regex);
						
						if (pws.length === 0) {
							showMessage(100 * (i + 1) / allCandidateWords.length);
						}
					}, 0, phraseWords);
					phraseWords.pop();
					cb();
				} else {
					phraseWords.pop();
					cb();
				}
			} else {
				cb();
			}
			
		}, function(result) {
			if (result) {
				if (typeof result === 'string') {
					console.log(result);
				} else {
					console.log('An error occured: ', err);
				}
			}
		});*/



		allCandidateWords.forEach(function(candidateWord, i) {
			if (wordOrderInPhrase === 0) {
				var percent = 100 * (i + 1) / allCandidateWords.length;
				showMessage('Tested ' + percent.toFixed(2) + '% of All Candidate Phrases');
				if (percent === 100) {
					process.stdout.write('\nNo Match Found!');
				}
			}
			if ((wordOrderInPhrase + 1) < 4) {
				phraseWords.push(candidateWord);
				var canidatePhraseChars = phraseWords.join('');
				var canidatePhraseCharsLength = canidatePhraseChars.length;
				var regexTestResult = regex.test(canidatePhraseChars);
				if ((wordOrderInPhrase + 1) === 3 && regexTestResult) {
					var phrase = phraseWords.join(' ');
					showMessage('canidatePhrase: ' + phrase);
				}
				// since spaces are not part of anagram consider removing the condition: wordOrderInPhrase+1 === anagramWordsLength
				// while keeping anagramCharsLength === phraseWords.join('').length
				if ((wordOrderInPhrase + 1) === 3 && regexTestResult && canidatePhraseCharsLength === anagramCharsLength) {
					// if (regexTestResult && canidatePhraseCharsLength === anagramCharsLength) {
					var phrase = phraseWords.join(' ');
					console.log('md5Hash testing for phrase: ' + phrase);
					if (md5Hash === md5(phrase)) {
						console.log(new Date());
						console.log('\nMatch Found! The decrypted phrase for the MD5 hash "' + md5Hash + '" is: ', phrase);
						// cb('Exiting!');
						process.exit(0);
					} else {
						phraseWords.pop();
						// cb();
					}
				} else if (regexTestResult && canidatePhraseCharsLength < anagramCharsLength) {
					// } else if ( regexTestResult && canidatePhraseCharsLength < anagramCharsLength) {
					// var phraseWordsBkp = phraseWords;
					// setTimeout(function(pws) {
					// console.log('pws', pws);
					self.decrypt(phraseWords, anagramWordsLength, md5Hash, anagramCharsLength, regex);


					// }, 0, phraseWords);
					phraseWords.pop();
					// cb();
				} else {
					phraseWords.pop();
					// cb();
				}

			} else {
				// 	cb();
			}
		});


	},

	decrypt_old: function(phraseWords, anagramWords, candidateWords, md5Hash) {
		var wordOrderInPhrase = phraseWords.length;
		var wordLength = anagramWords[wordOrderInPhrase].length;
		var self = this;
		candidateWords[wordLength].forEach(function(candidateWord, i) {
			phraseWords.push(candidateWord);
			if (wordOrderInPhrase === anagramWords.length - 1) {
				var phrase = phraseWords.join(' ');
				if (md5Hash === md5(phrase)) {
					console.log('\nMatch Found! The decrypted phrase for the MD5 hash "' + md5Hash + '" is: ', phrase);
					process.exit(0);
				}
			} else {
				self.decrypt(phraseWords, anagramWords, candidateWords, md5Hash);
			}
			phraseWords.pop();
			if (wordOrderInPhrase === 0) {
				showMessage(100 * (i + 1) / candidateWords[wordLength].length);
			}
		});
	}
};

var somefunc = function(previousWords, word) {

	var candidatePhrase = previousWords ? previousWords + ' ' + word : word;
	var canidatePhraseChars = candidatePhrase.replace(/[ ']/g, '');
	var remainingChars = anagramCharsLength - canidatePhraseChars.length;

	if (remainingChars < 0) {
		// candidatePhrase = null;
		// canidatePhraseChars = null;
		// remainingChars = null;
		return;
		// } else if (remainingChars === 0 && regex.test(canidatePhraseChars)) {
	// } else if (remainingChars === 0 && candidatePhrase.indexOf('\'')>-1 && regex.test(canidatePhraseChars)) {
	} else if (remainingChars === 0 && regex.test(canidatePhraseChars)) {
		// showMessage('Current Canidate Phrase: ' + candidatePhrase);
		latestMd5test = candidatePhrase;
		var candidateHash = md5(candidatePhrase);
		if (md5Hash == candidateHash || '23170acc097c24edb98fc5488ab033fe' === candidateHash || '665e5bcb0c20062fe8abaaf4628bb154' === candidateHash) { //consider adding regex.test(canidatePhraseChars) instead of upper if
			console.log(new Date());
			console.log('\nMatch Found! The decrypted phrase for the MD5 hash "' + candidateHash + '" is: ' + candidatePhrase);
			// cb('Exiting!');
			// process.exit(0);
		}
	} else if (remainingChars > 0 && regex.test(canidatePhraseChars)) { //remainingChars > 0 can be removed here
		var candidatePhraseWordsNum = candidatePhrase.split(' ').length;
		if ( candidatePhraseWordsNum < 3) {
			var diff = 3-candidatePhraseWordsNum;
			for (var i = remainingChars-diff; i > 0; i--) {
				for (var j = 0; j < candidateWordsArrays[i].length; j++) {
					somefunc(candidatePhrase, candidateWordsArrays[i][j]);
				}
			}
		} else if (candidatePhraseWordsNum === 3) {
			for (var j = 0; j < candidateWordsArrays[remainingChars].length; j++) {
				somefunc(candidatePhrase, candidateWordsArrays[remainingChars][j]);
			}
		}
	}
};

var somefunc4W = function(previousWords, word) {

	var candidatePhrase = previousWords ? previousWords + ' ' + word : word;
	var canidatePhraseChars = candidatePhrase.replace(/[ ']/g, '');
	var remainingChars = anagramCharsLength - canidatePhraseChars.length;

	if (remainingChars < 0) {
		// candidatePhrase = null;
		// canidatePhraseChars = null;
		// remainingChars = null;
		return;
		// } else if (remainingChars === 0 && regex.test(canidatePhraseChars)) {
	} else if (remainingChars === 0 && regex.test(canidatePhraseChars)) {
		// showMessage('Current Canidate Phrase: ' + candidatePhrase);
		latestMd5test = candidatePhrase;
		var candidateHash = md5(candidatePhrase);
		if (md5Hash == candidateHash || '23170acc097c24edb98fc5488ab033fe' === candidateHash || '665e5bcb0c20062fe8abaaf4628bb154' === candidateHash) { //consider adding regex.test(canidatePhraseChars) instead of upper if
			console.log(new Date());
			console.log('\nMatch Found! The decrypted phrase for the MD5 hash "' + candidateHash + '" is: ' + candidatePhrase);
			// cb('Exiting!');
			// process.exit(0);
		}
	} else if (remainingChars > 0 && regex.test(canidatePhraseChars)) { //remainingChars > 0 can be removed here
		var candidatePhraseWordsArray = candidatePhrase.split(' ');
		var candidatePhraseWordsNum = candidatePhraseWordsArray.length;
		if ( candidatePhraseWordsNum === 1 || candidatePhraseWordsNum === 2) {
			for (var i = remainingChars-1; i > 0; i--) {
				for (var j = 0; j < candidateWordsArrays[i].length; j++) {
					somefunc(candidatePhrase, candidateWordsArrays[i][j]);
				}
			}
		} else if (candidatePhraseWordsNum === 3) {
			for (var j = 0; j < candidateWordsArrays[remainingChars].length; j++) {
				somefunc(candidatePhrase, candidateWordsArrays[remainingChars][j]);
			}
		}
		

		/*if (word.length === 4) {
			for (var j = 0; j < candidateWordsArrays[7].length; j++) {
				somefunc(candidatePhrase, candidateWordsArrays[7][j]);
			}
		} else if (word.length === 7 && candidatePhraseWordsArray.length===2) {
			if (candidatePhraseWordsArray[0].length===7) {
				for (var j = 0; j < candidateWordsArrays[4].length; j++) {
					somefunc(candidatePhrase, candidateWordsArrays[4][j]);
				}
			} else {
				for (var j = 0; j < candidateWordsArrays[7].length; j++) {
					somefunc(candidatePhrase, candidateWordsArrays[7][j]);
				}
			}
		} else {
			for (var j = 0; j < candidateWordsArrays[4].length; j++) {
				somefunc(candidatePhrase, candidateWordsArrays[4][j]);
			}
			for (var j = 0; j < candidateWordsArrays[7].length; j++) {
				somefunc(candidatePhrase, candidateWordsArrays[7][j]);
			}
		}*/
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

var showMessage = function(msg) {
	process.stdout.clearLine();
	process.stdout.cursorTo(0);
	process.stdout.write('Tested ' + percent.toFixed(2) + '%  | ' + msg + ' | Last md5Hash test: ' + latestMd5test);
	/*if (percent === 100) {
		process.stdout.write('\nNo Match Found!');
	}*/
};