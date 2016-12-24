/*jshint esversion: 6 */
const utilities = require('./utilities');
const DecrypterFactory = require('./DecrypterFactory');
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;
// const numCPUs = 1;
let progressReport = [];
let matchings = [];

const _masterFunction = function(options) {
	const basicInput = [options.anagram, options.wordlistPath];
	cluster.setupMaster({
		args: basicInput.concat(options.md5Hashes)
	});
	// Fork workers.
	for (let i = 0; i < numCPUs; i++) {
		cluster.fork();
	}
};


if (cluster.isMaster) {
	const options = {
		anagram: 'poultry outwits ants',
		wordlistPath: './wordlist',
		md5Hashes: ['e4820b45d2277f3844eac66c903e84be', '23170acc097c24edb98fc5488ab033fe', '665e5bcb0c20062fe8abaaf4628bb154']
	};
	if (process.argv.indexOf('-m') > -1 || process.argv.indexOf('--manual') > -1) {
		utilities.getPrompts(options, 0, function() {
			_masterFunction(options);
		});
	} else {
		_masterFunction(options);
	}
	const md5HashesNum = options.md5Hashes.length;
	cluster.on('message', function(worker, message, handle) {
		if (arguments.length === 2) {
			handle = message;
			message = worker;
			worker = undefined;
		}
		utilities.msgHandler(progressReport, message, matchings, md5HashesNum);
	});
	cluster.on('exit', (worker, code, signal) => {
		if (Object.getOwnPropertyNames(cluster.workers).length === 0 && matchings.length < md5HashesNum) {
			process.stdout.write('\x1B[2J\x1B[0f');
			console.log('All workers finished, but could not find all Matching Phrases!');
			console.log(progressReport[1]);
			process.exit(0);
		}
	});

} else {
	const options = {
		anagram: process.argv[2],
		wordlistPath: process.argv[3],
		md5Hashes: process.argv.slice(4),
		workerId: cluster.worker.id,
		numCPUs: numCPUs
	};
	const decrypter = new DecrypterFactory(options);
	const anagramCharsLength = process.argv[2].replace(/ /g, '').length;

	const lineReader = require('readline').createInterface({
		input: require('fs').createReadStream(options.wordlistPath)
	});

	lineReader.on('line', function(word) {
		if (word.length <= anagramCharsLength && decrypter.regex.test(word)) {
			decrypter.pushToCandidateWords(word);
		}
	});

	lineReader.on('close', function() {
		decrypter.decrypt();
	});
}