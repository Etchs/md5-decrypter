var decrypter = require('./engine/decrypter');

var md5Hash = '4624d200580677270a54ccff86b9610e';
var anagram = 'poultry outwits ants';
var wordlistPath = './wordlist';

var i1 = process.argv.indexOf('--md5');
var i2 = process.argv.indexOf('--anagram');
var i3 = process.argv.indexOf('--wordlist');
if (i1 !== -1 && process.argv[i1 + 1]) {
	md5Hash = process.argv[i1 + 1];
}
if (i2 !== -1 && process.argv[i2 + 1]) {
	anagram = process.argv[i2 + 1];
}
if (i3 !== -1 && process.argv[i3 + 1]) {
	wordlistPath = process.argv[i3 + 1];
}

decrypter(md5Hash, anagram, wordlistPath);