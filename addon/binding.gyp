{
  "variables": {
    "my_root%": "./hal/",
    "my_include%": "./sdk/include/",
    "my_src%": "./sdk/src/",
    "my_sdk%": "./sdk/"
  },
  "targets": [
    {
      "target_name": "simple_stream",
      "sources": [ "simple-stream.cpp", "./sdk/src/rplidar_driver.cpp", "./sdk/src/hal/thread.cpp",
        "./sdk/src/arch/linux/net_serial.cpp", "./sdk/src/arch/linux/net_socket.cpp", "./sdk/src/arch/linux/timer.cpp"  ],
      "cflags": ["-Wall", "-std=c++11"],
      "cflags!": [ '-fno-exceptions' ],
      "cflags_cc!": [ '-fno-exceptions' ],
      "include_dirs" : ["<!(node -e \"require('nan')\")", "<!(node -e \"require('streaming-worker-sdk')\")",
                "<@(my_root)", "<@(my_include)", "<@(my_src)", "<@(my_sdk)"],
      "ldflags": ["-lrt", "-lstdc++", "-lpthread"]
    }
  ]
}
