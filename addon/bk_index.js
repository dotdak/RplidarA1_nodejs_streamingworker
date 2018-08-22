"use strict"; 
const path = require('path');
const worker = require("streaming-worker");
const addon_path = path.join(__dirname, "../addon/build/Release/simple_stream");
const simple_stream = worker(addon_path);

/*
simple_stream.from.on('data', function(value){
        console.log(JSON.parse(value));
});
*/
const through = require('through');

const pluck_and_parse = through(function (data) {
           		// the data coming in is an array, 
           		// Element 0 is the name of the event emitted by the addon (position_sample)
           		// Element 1 is the data - which in this case is 
           		this.queue(JSON.parse(data[1]));
               });

// the stream isn't created unless you ask for it...
const out = simple_stream.from.stream();
out.pipe(pluck_and_parse) // extract data
   .pipe(through(function(sample) { // just print the sample object
      		angle = sample.angle;
		dist = sample.distance;
  }))

process.on('SIGINT', function(){
        process.exit();
});
