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
		this.candidateWordsArrays[word.length].push(word);
		this.allCandidateWords.push(word);
	},

	decrypt: function() {
		this.allCandidateWords = _.uniq(this.allCandidateWords);
		this.allCandidateWords.sort();
		this.allCandidateWords.reverse();
		this.allCandidateWords.sort(function(a, b) {
			return (a.length - b.length);
		});
		for (let i = 0; i < this.candidateWordsArrays.length; i++) {
			this.candidateWordsArrays[i] = _.uniq(this.candidateWordsArrays[i]);
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
				if (this.currIndex % 5 === 0 || this.currIndex === this.maxIndex - 1) {
					process.send({
						msgType: 'progressReport',
						workerId: this.workerId,
						phraseWordsNum: this.currPhraseWordsNum,
						currIndex: this.currIndex + 1,
						maxIndex: this.maxIndex
					});
				}
				this.test(null, selectedCandidateWords[this.currIndex], this.currPhraseWordsNum);
			}
		}
	},

	test: function(previousWords, word, phraseWordsNum) {
		const candidatePhrase = previousWords ? previousWords + ' ' + word : word;
		const canidatePhraseChars = candidatePhrase.replace(/ /g, '');
		const remainingChars = this.anagramCharsLength - canidatePhraseChars.length; //13

		if (remainingChars < 0) {
			return;
		} else if (remainingChars === 0 && this.regex.test(canidatePhraseChars)) {
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