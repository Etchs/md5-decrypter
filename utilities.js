/*jshint esversion: 6 */
const _ = require('lodash');
const prompts = require('readline').createInterface(process.stdin, process.stdout);

module.exports = {
	getPrompts: function(options, code, cb) {
		switch (code) {
			case 0:
				prompts.question('What is the anagram? (press enter to use the default: "' + options.anagram + '")\n', (ans) => {
					if (ans) {
						options.anagram = ans;
					}
					module.exports.getPrompts(options, ++code, cb);
				});
				break;
			case 1:
				prompts.question('What is the path to the wordlist dictionary file? (press enter to use the default: "' + options.wordlistPath + '")\n', (ans) => {
					if (ans) {
						options.wordlistPath = ans;
					}
					module.exports.getPrompts(options, ++code, cb);
				});
				break;
			case 2:
				prompts.question('Please write an MD5 hash that you would like to check? ( press enter to use the default: ' + options.md5Hashes + ' )\n', (ans) => {
					if (ans) {
						options.md5Hashes = [];
						options.md5Hashes.push(ans);
						module.exports.getPrompts(options, ++code, cb);
					} else {
						cb();
					}
				});
				break;
			case 3:
				prompts.question('Please write an additional MD5 hash that you would like to check? (press enter to stop adding any more MD5 hashes)\n', (ans) => {
					if (ans) {
						options.md5Hashes.push(ans);
						module.exports.getPrompts(options, code, cb);
					} else {
						cb();
					}
				});
				break;
			default:
				break;
		}
	},

	regexGenerator: function(anagramChars) {
		const uniqueChars = _.uniq(anagramChars);
		let subregex1 = '';
		let subregex2 = '';
		uniqueChars.forEach(function(c) {
			let n = anagramChars.split(c).length; // 1 + Number of times this character is repeated in the anagram
			if (n === 2) {
				subregex1 += c;
			} else if (n > 2) {
				subregex2 += '(?!(.*' + c + '){' + (n) + '})';
			}
		});
		let regexString = '^(?!.*([' + subregex1 + ']).*\\1)' + subregex2 + '[' + uniqueChars.join("") + ']*$';
		return new RegExp(regexString);
	},

	initProgress: function(progressReport, message) {
		progressReport[0] = message.allCandidateWordsArrayLength;
		progressReport[1] = '';
		for (let i = 2; i <= message.maxPhraseWordsNum; i++) {
			progressReport[i] = [];
		}
	},

	updateProgress: function(progressReport, message) {
		progressReport[message.phraseWordsNum][message.workerId] = {
			currIndex: message.currIndex,
			maxIndex: message.maxIndex
		};

		let log = progressReport[1];
		for (let i = 2; i < progressReport.length; i++) {
			let total = 0;
			for (let j = 0; j < progressReport[i].length; j++) {
				if (typeof progressReport[i][j] !== 'undefined') {
					total += progressReport[i][j].currIndex;
				}
			}
			if (progressReport[i].length) {
				log += (total * 100 / progressReport[0]).toFixed(2) + ' % of ' + i + ' words phrases completed\n';
			}
		}
		showMessage(log);
	}
};

var showMessage = function(msg) {
	process.stdout.write('\x1Bc');
	// process.stdout.clearLine();
	// process.stdout.cursorTo(0);
	process.stdout.write(msg);
};