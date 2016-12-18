/**
 * DecrypterFactory
 */
var md5 = require('md5');
var async = require('async');
var _ = require('lodash');

var _unique = function(anagramChars) {
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

var _regexGenerator_new = function(anagramChars) {
	var uniqueChars = _unique(anagramChars);
	var subregex1 = '';
	var subregex2 = '';
	uniqueChars.forEach(function(c) {
		var n = anagramChars.split(c).length; // 1 + Number of times this character is repeated in the anagram
		if (n === 2) {
			subregex1 += c;
		} else if (n > 2) {
			subregex2 += '(?!(.*' + c + '){3})';
		}
	});
	var regexString = '^(?!.*([' + subregex1 + ']).*\\1)' + subregex2 + '[' + uniqueChars.join("") + ']*$';
	// var regexString = '^(?!.*([' + subregex1 + ']).*\\1)' + subregex2 + '[' + uniqueChars + ']*$';
	console.log(regexString);
	return new RegExp(regexString);
};

var _regexGenerator = function(anagramChars) {
	var uniqueChars = _unique(anagramChars);
	var regexString = '^';
	uniqueChars.forEach(function(c) {
		var n = anagramChars.split(c).length; // 1 + Number of times this character is repeated in the anagram
		regexString += '(?!(?:([^' + c + ']*)+' + c + '){' + n + '})';
	});
	regexString += '[' + uniqueChars.join("") + ']+$';
	// regexString += '[' + uniqueChars + ']+$';
	console.log(regexString);
	return new RegExp(regexString);
};

function Decrypter(options) {
	this.candidateWordsArrays = [];
	this.anagramChars = anagramChars;
	this.anagramCharsLength = anagramChars.length;
	this.allCandidateWords = [];
	this.md5Hash = md5Hash;
	this.regex;
	this.percent = 0;
	this.latestMd5test;
	this.candidateWordsArrays[0] = [];
	for (var i = 1; i <= anagramCharsLength; i++) {
		this.candidateWordsArrays[i] = [];
	}
	this.regex = _regexGenerator(anagramChars);
}

Decrypter.prototype = {
	pushToCandidateWords: function(word) {
		this.candidateWordsArrays[word.length].push(word);
	},

	pushToAllCandidateWords: function(word) {
		this.allCandidateWords.push(word);
	},

	push: function(data, priority) {
		var node = new Node(data, priority);
		this.bubble(this.heap.push(node) - 1);
	},

	// removes and returns the data of highest priority
	pop: function() {
		var topElement = this.heap.pop();
		if (typeof topElement != 'undefined'){
			var topVal = topElement.data;
			return topVal;
		} else {
			return undefined;
		}
	},

	popQuote: function(quoteId) {
		for (var i = this.heap.length - 1; i >= 0; i--) {
			var element = this.heap[i].data;
			if(this.heap[i].data.id == quoteId){
				this.heap.splice(i, 1);
				return element;
			}
			if(i===0){
				return undefined;
			}
		}
	},

	// bubbles node i up the binary tree based on
	// priority until heap conditions are restored
	bubble: function(i) {
		while (i > 0) {
			var parentIndex = i >> 1; // <=> floor(i/2)

			// if equal, no bubble (maintains insertion order)
			if (!this.isHigherPriority(i, parentIndex)) break;

			this.swap(i, parentIndex);
			i = parentIndex;
		}
	},

	// swaps the addresses of 2 nodes
	swap: function(i, j) {
		var temp = this.heap[i];
		this.heap[i] = this.heap[j];
		this.heap[j] = temp;
	},

	// returns true if node i is higher priority than j
	isHigherPriority: function(i, j) {
		return this.heap[i].priority < this.heap[j].priority;
	}
};


module.exports = Decrypter(options);

};
