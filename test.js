const cluster = require('cluster');
const numCPUs = require('os').cpus().length;
var _ = require('lodash');
var a = [];
var n = 0;
if (cluster.isMaster) {
	var s = 'asdwqsddwggw';
	var u = _.uniq(s).length;
	console.log('u ', u);
  // Fork workers.
  for (var i = 0; i < numCPUs; i++) {
  	n = i;
  	a.push(n);
    var worker = cluster.fork();
    worker.send({
    	i: i
    });
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
    if (worker.id===3){
    	cluster.fork();
    }
  });
} else {
  // Workers can share any TCP connection
  // In this case it is an HTTP server
  console.log('cluster.worker', cluster.worker.id);
  // if(cluster.worker.id == 3) {
  // 	process.exit(0);
  // }
  process.on('message', (msg) => {
    console.log(msg.i + ' / ' + numCPUs);
  });
}
  


/*var lineReader = require('readline').createInterface({
	input: require('fs').createReadStream('./wordlist')
});
var regex = /[a-z]/;
var lookouts = [];
var chars = [];
lineReader.on('line', function(word) {
	var numOfSymb = 0;
	for (var i = 0; i < word.length; i++) {
		if (!regex.test(word[i])) {
			if(word[i]==='\'') {
				numOfSymb++;
			}
			if (chars.indexOf(word[i]) === -1) {
				chars.push(word[i]);
			}
		}
	}
	if(numOfSymb>1){
		lookouts.push(word);
	}
});

lineReader.on('close', function() {
	console.log('chars: ', chars);
	console.log('lookouts: ', lookouts);
});*/