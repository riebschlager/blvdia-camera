#!/bin/bash

mkdir /home/pi/blvdia-camera/tmp

for i in `seq 1 5`;
    do
        fswebcam --no-banner -r 640x480 --jpeg 95 /home/pi/blvdia-camera/tmp/img$i.jpg
        convert /home/pi/blvdia-camera/tmp/img$i.jpg /home/pi/blvdia-camera/overlay.png +append /home/pi/blvdia-camera/tmp/timg$i.jpg
        echo 'snap'
done

convert -delay 50 -size 640x480 \
    -page +0+0 /home/pi/blvdia-camera/tmp/timg1.jpg \
    -page +0+0 /home/pi/blvdia-camera/tmp/timg2.jpg \
    -page +0+0 /home/pi/blvdia-camera/tmp/timg3.jpg \
    -page +0+0 /home/pi/blvdia-camera/tmp/timg4.jpg \
    -page +0+0 /home/pi/blvdia-camera/tmp/timg5.jpg \
    -loop 0 /home/pi/blvdia-camera/animation.gif

rm -rf /home/pi/blvdia-camera/tmp
