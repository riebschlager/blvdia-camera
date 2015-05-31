#!/bin/bash

mkdir /home/pi/blvdia-camera/tmp

for i in `seq 0 4`;
    do
        fswebcam --no-banner --flip h,v -r 640x480 --overlay /home/pi/blvdia-camera/overlay.png /home/pi/blvdia-camera/tmp/img$i.jpg
        printf 'snap'
done

convert /home/pi/blvdia-camera/tmp/*.jpg -delay 50 -loop 0 -fuzz 50% -layers OptimizeFrame +matte +map /home/pi/blvdia-camera/animation.gif

rm -rf /home/pi/blvdia-camera/tmp
