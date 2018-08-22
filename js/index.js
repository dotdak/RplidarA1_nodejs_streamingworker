"use strict"; 
class Point{
        constructor(){
                this._x = 0;
                this._y = 0;
        }
        init(radius, theta){
                this._x = Math.round(radius/1600*391 * Math.cos(theta/180*Math.PI) + 391);
                this._y = Math.round(437 - radius/1600*391 * Math.sin(theta/180*Math.PI));
        }


        get x(){
                return this._x;
        }

        get y(){
                return this._y;
        }
}

var http = require('http').createServer(handler);
var fs = require('fs');
var io = require('socket.io')(http);
var exec = require('child_process').exec;
//---------------------------------------------------v
const BUFFER_SIZE = 600;

var point = new Point();
var coor = [];
//---------------------------------------------------^
const path = require('path');
const worker = require("streaming-worker");
const through = require('through');
const addon_path = path.join(__dirname, "../addon/build/Release/simple_stream");
const simple_stream = worker(addon_path);
const out = simple_stream.from.stream();
//---------------------------------------------------

http.listen(8080);

function handler(req, res) {
        fs.readFile('./lidarUI.html', null, function(err,data) {
                if(err) {
                        res.writeHead(404, {'Content-Type': 'text/html'});
                        res.write('File Not Found');
                } else {
                        res.writeHead(200, {'Content-Type': 'text/html'});
                        res.write(data);
                }
                res.end();
        });
}

/*
var pluck_and_parse = through(function (data) {
           		// the data coming in is an array, 
           		// Element 0 is the name of the event emitted by the addon (position_sample)
           		// Element 1 is the data - which in this case is 
           		this.queue(JSON.parse(data[1]));
               });

// the stream isn't created unless you ask for it...
out.pipe(pluck_and_parse) // extract data
   .pipe(through(function(sample) { // just print the sample object
      		angle = sample.angle;
		distance = sample.distance;
  }))
*/
var SEND_FLAG = false;
const NUM_MIN = 100;
io.sockets.on('connection', function(socket){
        //var value = 0;
        //socket.on('close', function(data){
        //        value = data;
        //        console.log("button connected: " + value);
        //        theta = 0;
        //});
	
	simple_stream.from.on('data', function(dat){
        	let data = dat.split(',');
		//console.log(data);
		let angle = data[0];
		let distance = data[1];
		if((angle >= 0) && (angle <= 180)){
			if(!SEND_FLAG) SEND_FLAG = true;
               		point.init(distance, angle);
			console.log(distance, ' ', angle);
	               	coor.push(point.x);
        	       	coor.push(point.y);
		}
		else{
               		if(SEND_FLAG){	//if(angle > 358){//if (coor.length >= BUFFER_SIZE){ // change the condition to coor.length < BUFFER_SIZE
                       		if(coor.length >= NUM_MIN) socket.emit("newPoint", coor);
                       	//console.log(coor);
                       		coor.length = 0;
				SEND_FLAG = false;
			}
               	}
	});
});

process.on('SIGINT', function(){
        process.exit();
});

