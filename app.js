/*jshint esversion: 6 */
const utilities = require('./utilities');
const DecrypterFactory = require('./DecrypterFactory');
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;
// const numCPUs = 1;

const masterFunction = function(options) {
	const basicInput = [options.anagram, options.wordlistPath];
	cluster.setupMaster({
		args: basicInput.concat(options.md5Hashes)
	});
	// Fork workers.
	for (let i = 0; i < numCPUs; i++) {
		cluster.fork();
	}

	cluster.on('exit', (worker, code, signal) => {
		console.log(`worker ${worker.process.pid} finished`);
	});
};

let progressReport = [];
let matchingPhrases = [];
if (cluster.isMaster) {
	const options = {
		anagram: 'poultry outwits ants',
		wordlistPath: './wordlist',
		phraseHasApostrophe: false,
		md5Hashes: ['e4820b45d2277f3844eac66c903e84be', '23170acc097c24edb98fc5488ab033fe', '665e5bcb0c20062fe8abaaf4628bb154']
	};
	if (process.argv.indexOf('-i') > -1 || process.argv.indexOf('--interactive') > -1) {
		utilities.getPrompts(options, 0, function() {
			masterFunction(options);
		});
	} else {
		masterFunction(options);
	}

	cluster.on('message', function(worker, message, handle) {
		if (arguments.length === 2) {
			handle = message;
			message = worker;
			worker = undefined;
		}
		if(message.msgType==='progressReport') {
			utilities.updateProgress(progressReport, message);
		} else if (!progressReport[0] && message.msgType==='initProgressReport') {
			utilities.initProgress(progressReport, message);
		} else if (message.msgType==='matchFound') {
			console.log('\nMatch Found! The decrypted phrase for the MD5 hash "' + message.matchingHash + '" is: ' + message.matchingPhrase);
			matchingPhrases.push(message.matchingPhrase);
			progressReport[1] = 'The Matching Phrases so far are: ' + matchingPhrases + '\n';
			if(matchingPhrases.length===options.md5Hashes.length) {
				console.log('Found All Matching Phrases!');
				console.log('The Matching Phrases are: ', matchingPhrases);
				console.log('Exiting...');
				process.exit(0);
			}
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

	lineReader.on('line', function(lineWord) {
		let word = lineWord;

		// uncomment the following only in case the solution phrase contains an apostrophe while the anagram doesn't!
		if(lineWord.indexOf('\'')>-1
			|| lineWord.indexOf('é')>-1
			|| lineWord.indexOf('ó')>-1
			|| lineWord.indexOf('ü')>-1
			|| lineWord.indexOf('á')>-1
			|| lineWord.indexOf('è')>-1
			|| lineWord.indexOf('ö')>-1
			|| lineWord.indexOf('ñ')>-1
			|| lineWord.indexOf('â')>-1
			|| lineWord.indexOf('û')>-1
			|| lineWord.indexOf('ä')>-1
			|| lineWord.indexOf('ê')>-1
			|| lineWord.indexOf('ç')>-1
			|| lineWord.indexOf('ô')>-1
			|| lineWord.indexOf('å')>-1
			|| lineWord.indexOf('í')>-1
			|| lineWord.indexOf('Å')>-1){
			word = lineWord.replace(/['éóüáèöñâûäêçôåíÅ]/g, '');
		}

		if (word.length <= anagramCharsLength && decrypter.regex.test(word)) {
			decrypter.pushToCandidateWords(lineWord);
		}
	});

	lineReader.on('close', function() {
		decrypter.decrypt();
	});
}