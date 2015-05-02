var dir = '/home/pi/blvdia-camera/';
var AWS = require('aws-sdk');
var childProcess = require('child_process');
var config = require('./config');
var fs = require('fs');
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
      Key: clientId + '.gif',
      ContentType: 'image/gif',
      Body: body
    };

    s3.putObject(params, function(err, data) {
      if (err) {
        console.log(err);
      } else {
        socket.emit('complete', {
          clientId: clientId,
          url: 'https://s3-us-west-2.amazonaws.com/blvdia/' + clientId + '.gif'
        });
        childProcess.exec('rm ' + dir + 'animation.gif');
      }
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
