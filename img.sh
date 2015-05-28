#!/bin/bash

mkdir /home/pi/blvdia-camera/tmp

for i in `seq 0 4`;
    do
        fswebcam --no-banner --flip h,v -r 640x480 --overlay /home/pi/blvdia-camera/overlay.png /home/pi/blvdia-camera/tmp/img$i.jpg
        printf 'snap'
done

avconv -y -framerate 2 -f image2 -i /home/pi/blvdia-camera/tmp/img%d.jpg -vcodec libx264 /home/pi/blvdia-camera/animation.mp4

rm -rf /home/pi/blvdia-camera/tmp
