#!/bin/bash

mkdir /home/pi/blvdia-camera/tmp

for i in `seq 0 4`;
    do
        fswebcam --no-banner -r 640x480 --jpeg 95 --overlay /home/pi/blvdia-camera/overlay.png /home/pi/blvdia-camera/tmp/img$i.jpg
        printf 'snap'
done

#avconv -y -framerate 1 -f  -i /home/pi/blvdia-camera/tmp/img%d.jpg -vcodec libx264 /home/pi/blvdia-camera/animation.mp4
avconv -y -framerate 1 -f image2 -i /home/pi/blvdia-camera/tmp/img%d.jpg -b 65536k -vcodec libx264 /home/pi/blvdia-camera/animation.mp4

rm -rf /home/pi/blvdia-camera/tmp
