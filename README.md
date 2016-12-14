# md5-decrypter

##Prerequisite
In order to start this application, your machine must have node.js v0.12 or later and you'll need to run this command:
```bash
$ npm install
```

##To start the app, type the following command
```bash
$ node app.js
```

##Optional Commands:
```bash
$ node app.js --anagram 'anagram string'               # Start the app with the anagram 'anagram string'
                                                       # default value is: 'poultry outwits ants'
                                                       
$ node app.js --md5 23d9536228d2a3d1c5bf7d38760d6513   # Start the app with the md5 hash '23d9536228d2a3d1c5bf7d38760d6513'
                                                       # default value is: '4624d200580677270a54ccff86b9610e'
                                                       
$ node app.js --wordlist './path/to/dictionary'        # Start the app with a dictionary path './path/to/dictionary'
                                                       # default value is: './wordlist'
```
