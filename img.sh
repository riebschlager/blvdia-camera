#!/bin/bash

mkdir /home/pi/blvdia-camera/tmp

for i in `seq 1 5`;
    do
        fswebcam --no-banner -r 640x480 --png 9 --overlay /home/pi/blvdia-camera/overlay.png /home/pi/blvdia-camera/tmp/img$i.png
        echo 'snap'
done

convert -delay 50 -size 640x480 \
    -page +0+0 /home/pi/blvdia-camera/tmp/img1.png \
    -page +0+0 /home/pi/blvdia-camera/tmp/img2.png \
    -page +0+0 /home/pi/blvdia-camera/tmp/img3.png \
    -page +0+0 /home/pi/blvdia-camera/tmp/img4.png \
    -page +0+0 /home/pi/blvdia-camera/tmp/img5.png \
    -loop 0 /home/pi/blvdia-camera/animation.gif

rm -rf /home/pi/blvdia-camera/tmp
