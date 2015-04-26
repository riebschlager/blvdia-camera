#!/bin/bash

mkdir /home/pi/blvdia-camera/tmp

for i in `seq 1 5`;
    do
        fswebcam --no-banner -r 640x480 --jpeg 95 /home/pi/blvdia-camera/tmp/img$i.jpg
        convert /home/pi/blvdia-camera/tmp/img$i.jpg \ 
        /home/pi/blvdia-camera/overlay.png +append /home/pi/blvdia-camera/tmp/img$i.jpg
        echo 'snap'
done

convert -delay 50 -size 640x480 \
    -page +0+0 /home/pi/blvdia-camera/tmp/img1.jpg \
    -page +0+0 /home/pi/blvdia-camera/tmp/img2.jpg \
    -page +0+0 /home/pi/blvdia-camera/tmp/img3.jpg \
    -page +0+0 /home/pi/blvdia-camera/tmp/img4.jpg \
    -page +0+0 /home/pi/blvdia-camera/tmp/img5.jpg \
    -loop 0 /home/pi/blvdia-camera/animation.gif

rm -rf /home/pi/blvdia-camera/tmp
