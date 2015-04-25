var AWS = require('aws-sdk');
var dir = '/home/pi/blvdia-camera/';
var config = require('./config');
var childProcess = require('child_process');
var imgur = require('imgur');
var io = require('socket.io-client');
var socket = io.connect('blvdia.herokuapp.com', {
    port: 80
});

socket.on('shutter', function(msg) {
    if (msg.cameraId === config.cameraId) {
        start(msg.clientId);
    }
});

var start = function(clientId) {
    var snapIndex = 0;
    var exec = childProcess.exec(dir + 'img.sh');

    exec.on('exit', function() {
        var s3 = new AWS.S3();
        var body = fs.createReadStream(dir + 'animation.gif');
        var params = {
            Bucket: 'blvdia',
            Key: 'myKey',
            Body: body
        };

        s3.putObject(params, function(err, data) {
            if (err) {
                console.log(err);
            } else {
                console.log("Successfully uploaded data to myBucket/myKey");
            }

        });


        imgur.uploadFile(dir + 'animation.gif')
            .then(function(json) {
                socket.emit('complete', {
                    clientId: clientId,
                    url: json.data.link
                });
                childProcess.exec('rm ' + dir + 'animation.gif')
            })
            .catch(function(err) {
                console.error(err.message);
            });
    });

    exec.stdout.on('data', function(data) {
        if (data.indexOf('snap') > -1) {
            socket.emit('snap', {
                index: snapIndex,
                clientId: clientId
            });
            snapIndex++;
        }
    });
};