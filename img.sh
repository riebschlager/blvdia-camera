#!/bin/bash

mkdir /home/pi/blvdia-camera/tmp

for i in `seq 0 4`;
    do
        fswebcam --no-banner --flip h,v -r 640x480 --overlay /home/pi/blvdia-camera/overlay.png /home/pi/blvdia-camera/tmp/img$i.jpg
        printf 'snap'
done

# convert -delay 50 -size 640x480 \
#     -page +0+0 /home/pi/blvdia-camera/tmp/img0.jpg \
#     -page +0+0 /home/pi/blvdia-camera/tmp/img1.jpg \
#     -page +0+0 /home/pi/blvdia-camera/tmp/img2.jpg \
#     -page +0+0 /home/pi/blvdia-camera/tmp/img3.jpg \
#     -page +0+0 /home/pi/blvdia-camera/tmp/img4.jpg \
#     -loop 0 /home/pi/blvdia-camera/animation.gif

convert -delay 50 -loop 0 -fuzz 5% -layers OptimizeFrame /home/pi/blvdia-camera/tmp/*.jpg /home/pi/blvdia-camera/animation.gif

rm -rf /home/pi/blvdia-camera/tmp
