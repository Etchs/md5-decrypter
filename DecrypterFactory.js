/*jshint esversion: 6 */
/**
 * DecrypterFactory
 */
var crypto = require('crypto');
var _ = require('lodash');
var utilities = require('./utilities');

function Decrypter(options) {
	this.numCPUs = options.numCPUs;
	this.workerId = options.workerId;
	this.candidateWordsArrays = [];
	this.candidateWordsArrays[0] = [];
	this.anagramChars = options.anagram.replace(/ /g, '');
	this.anagramCharsLength = this.anagramChars.length;
	this.allCandidateWords = [];
	this.md5Hashes = options.md5Hashes;
	this.percent = 0;
	this.currPhraseWordsNum = 2;
	this.maxPhraseWordsNum = this.anagramCharsLength;
	this.currIndex = 0;
	this.maxIndex = 0;
	for (let i = 1; i <= this.anagramCharsLength; i++) {
		this.candidateWordsArrays[i] = [];
	}
	this.regex = utilities.regexGenerator(this.anagramChars);
}

Decrypter.prototype = {
	pushToCandidateWords: function(word) {
		// this.candidateWordsArrays[word.length].push(word);
		this.allCandidateWords.push(word);

		// uncomment the following only in case the solution phrase contains an apostrophe while the anagram doesn't!
		if(word.indexOf('\'')>-1
			|| word.indexOf('é')>-1
			|| word.indexOf('ó')>-1
			|| word.indexOf('ü')>-1
			|| word.indexOf('á')>-1
			|| word.indexOf('è')>-1
			|| word.indexOf('ö')>-1
			|| word.indexOf('ñ')>-1
			|| word.indexOf('â')>-1
			|| word.indexOf('û')>-1
			|| word.indexOf('ä')>-1
			|| word.indexOf('ê')>-1
			|| word.indexOf('ç')>-1
			|| word.indexOf('ô')>-1
			|| word.indexOf('å')>-1
			|| word.indexOf('í')>-1
			|| word.indexOf('Å')>-1 ) {
			const wordChars = word.replace(/['éóüáèöñâûäêçôåíÅ]/g, '');
			this.candidateWordsArrays[wordChars.length].push(word);
		} else {
			this.candidateWordsArrays[word.length].push(word);
		}
	},

	decrypt: function() {
		this.allCandidateWords = _.uniq(this.allCandidateWords);
		this.allCandidateWords.sort();
		// let candidateWordsArraysLengths = [];
		for (let i = 0; i < this.candidateWordsArrays.length; i++) {
			this.candidateWordsArrays[i] = _.uniq(this.candidateWordsArrays[i]);
			// candidateWordsArraysLengths[i] = this.candidateWordsArrays[i].length;
			// this.candidateWordsArrays[i].sort();
			// console.log('candidateWordsArrays['+i+'].length: ', candidateWordsArrays[i].length);
		}

		const lowBound = ((this.workerId - 1)) / this.numCPUs;
		const highBound = (this.workerId) / this.numCPUs;
		const allCandidateWordsArrayLength = this.allCandidateWords.length;
		process.send({
			msgType: 'initProgressReport',
			workerId: this.workerId,
			allCandidateWordsArrayLength: allCandidateWordsArrayLength,
			maxPhraseWordsNum: this.maxPhraseWordsNum
		});
		const selectedCandidateWords = this.allCandidateWords.slice(lowBound * allCandidateWordsArrayLength, highBound * allCandidateWordsArrayLength);
		this.maxIndex = selectedCandidateWords.length;
		for (; this.currPhraseWordsNum <= this.maxPhraseWordsNum; this.currPhraseWordsNum++) {
			for (this.currIndex = 0; this.currIndex < this.maxIndex; this.currIndex++) {
				process.send({
					msgType: 'progressReport',
					workerId: this.workerId,
					phraseWordsNum: this.currPhraseWordsNum,
					currIndex: this.currIndex+1,
					maxIndex: this.maxIndex
				});
				this.test(null, selectedCandidateWords[this.currIndex], this.currPhraseWordsNum);
			}
		}
	},

	test: function(previousWords, word, phraseWordsNum) {
		const candidatePhrase = previousWords ? previousWords + ' ' + word : word;
		// const canidatePhraseChars = candidatePhrase.replace(/ /g, '');
		const canidatePhraseCharsSemiPure1 = candidatePhrase.replace(/ /g, '');
		// uncomment the following line only in case the solution phrase contains an apostrophe while the anagram doesn't!
		// const canidatePhraseChars = candidatePhrase.replace(/[ ']/g, '');
		const canidatePhraseCharsSemiPure2 = candidatePhrase.replace(/[ ']/g, '');
		const canidatePhraseChars = candidatePhrase.replace(/[ 'éóüáèöñâûäêçôåíÅ]/g, '');
		const remainingChars = this.anagramCharsLength - canidatePhraseChars.length; //13

		if (remainingChars < 0) {
			return;
		} else if ((remainingChars === 0 || canidatePhraseCharsSemiPure1.length==this.anagramCharsLength || canidatePhraseCharsSemiPure2.length==this.anagramCharsLength) && this.regex.test(canidatePhraseChars)) {
			let candidateHash = crypto.createHash('md5').update(candidatePhrase).digest("hex");
			if (this.md5Hashes.indexOf(candidateHash) > -1) {
				process.send({
					msgType: 'matchFound',
					workerId: this.workerId,
					matchingHash: candidateHash,
					matchingPhrase: candidatePhrase
				});
			}
		} else if (this.regex.test(canidatePhraseChars)) { // if a canidate phrase failed the regex test, no need to complete it the phrase
			const candidatePhraseWordsNum = candidatePhrase.split(' ').length;
			const beforeLastWordNum = phraseWordsNum - 1;
			if (candidatePhraseWordsNum < beforeLastWordNum) { // more than two words remaining
				const remainingWordsTillLast = beforeLastWordNum - candidatePhraseWordsNum;
				for (let i = remainingChars - remainingWordsTillLast; i > 0; i--) {
					for (let j = 0; j < this.candidateWordsArrays[i].length; j++) {
						this.test(candidatePhrase, this.candidateWordsArrays[i][j], phraseWordsNum);
					}
				}
			} else if (candidatePhraseWordsNum === beforeLastWordNum) { // exactly one word remaining
				for (let j = 0; j < this.candidateWordsArrays[remainingChars].length; j++) {
					this.test(candidatePhrase, this.candidateWordsArrays[remainingChars][j], phraseWordsNum);
				}
			}
		}
	}

};


module.exports = Decrypter;