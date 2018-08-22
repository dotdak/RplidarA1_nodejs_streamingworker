#include "streaming-worker.h"
#include <stdio.h>
#include <stdlib.h>

#include "rplidar.h" //RPLIDAR standard sdk, all-in-one header

#ifndef _countof
#define _countof(_Array) (int)(sizeof(_Array) / sizeof(_Array[0]))
#endif

#ifdef _WIN32
#include <Windows.h>
#define delay(x)   ::Sleep(x)
#else
#include <unistd.h>
static inline void delay(_word_size_t ms){
    while (ms>=1000){
        usleep(1000*1000);
        ms-=1000;
    };
    if (ms!=0)
        usleep(ms*1000);
}
#endif

#include <signal.h>

using namespace rp::standalone::rplidar;

bool ctrl_c_pressed;
void ctrlc(int)
{
    ctrl_c_pressed = true;
    exit(1);
}

const char * opt_com_path = "/dev/ttyUSB0";
    _u32         baudrateArray = 115200;
    u_result     op_result;

class Simple : public StreamingWorker {
    public:
    Simple(Callback *data, Callback *complete, Callback *error_callback, v8::Local<v8::Object> & options) 
          : StreamingWorker(data, complete, error_callback){

        // nothing needs to be here - just make sure you call base constructor
        // The options parameter is for your JavaScript code to pass in 
        // an options object.  You can use this for whatever you want.
    }
     
    void Execute (const AsyncProgressWorker::ExecutionProgress& progress) {
    	RPlidarDriver * drv = RPlidarDriver::CreateDriver(DRIVER_TYPE_SERIALPORT);
	while(!drv) {
	 	RPlidarDriver::DisposeDriver(drv);
		drv = RPlidarDriver::CreateDriver(DRIVER_TYPE_SERIALPORT);
		printf("insufficient memory");
	}
	while(!IS_OK(drv->connect(opt_com_path, baudrateArray)))
		printf("problem with drv");
    	signal(SIGINT, ctrlc);
	drv->startMotor();
	drv->startScan(0,1);
	printf("starting");
	while (1) {
        	rplidar_response_measurement_node_t nodes[8192];
        	size_t   count = _countof(nodes);

        	op_result = drv->grabScanData(nodes, count);//getScanDataWithInterval(nodes, count);// 
  		if (IS_OK(op_result) || op_result == RESULT_OPERATION_TIMEOUT) {
            		//drv->ascendScanData(nodes, count);
            		for (int pos = 0; pos < (int)count ; ++pos) {
				string distance = std:: to_string(nodes[pos].distance_q2/4.0f);
				string angle = std::to_string((nodes[pos].angle_q6_checkbit >> RPLIDAR_RESP_MEASUREMENT_ANGLE_SHIFT)/64.0f);
				//Message data("data", "{\"angle\":" + angle + ",\"distance\":" + distance + "}");
                        	Message data("data", angle + "," + distance + ",");
				writeToNode(progress, data);
				if (ctrl_c_pressed){
            				break;
        			}
            		}
		}
		else {
			printf("got here");
			drv->startMotor();
       			drv->startScan(0,1);
		}
	}
	//for (int i = 0; i < 100; i++ ) {
        //	Message tosend("integer", std::to_string(i));
        //	writeToNode(progress, tosend);
      	//}
    	RPlidarDriver::DisposeDriver(drv);
    	drv = NULL;
    }
};

StreamingWorker * create_worker(Callback *data
    , Callback *complete
    , Callback *error_callback, v8::Local<v8::Object> & options) {
 
 return new Simple(data, complete, error_callback, options);
}

NODE_MODULE(simple_streample, StreamWorkerWrapper::Init)
