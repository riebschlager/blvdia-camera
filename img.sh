#!/bin/bash

mkdir ./tmp

for i in `seq 1 5`;
    do
        fswebcam --no-banner -r 2592x1944 --jpeg 95 --scale 640x480 ./tmp/img$i.jpg
        echo 'snap'
done

convert -delay 50 -size 640x480 \
    -page +0+0 ./tmp/img1.jpg \
    -page +0+0 ./tmp/img2.jpg \
    -page +0+0 ./tmp/img3.jpg \
    -page +0+0 ./tmp/img4.jpg \
    -page +0+0 ./tmp/img5.jpg \
    -loop 0 -layers OptimizePlus animation.gif

rm -rf ./tmp
