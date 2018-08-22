# RplidarA1_nodejs_streamingworker

NodeJS + C through Streaming-worker library

This project was used in obstacle detection for automobile.
Streaming-woker tutorial can be found here https://github.com/freezer333/streaming-worker.
The NodeJS code is based on https://github.com/Awk34/node-rplidar. But I have changed some inconvenient parts on this source code.
Run the code by typing :
To build C files, go to /addon/ and type:
$ node-gyp configure build
To run nodejs, go to /js/ and type:
$ node index.js

Then go to <RaspberryPi's IP>:8080 to see the drawing in real-time.
