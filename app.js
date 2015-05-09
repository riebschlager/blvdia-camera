var dir = '/home/pi/blvdia-camera/';
var AWS = require('aws-sdk');
var childProcess = require('child_process');
var fs = require('fs');
var io = require('socket.io-client');
var serialResult = childProcess.execSync('python ' + dir + 'serial.py');
var serial = serialResult.toString();
var cameraId;

switch (serial) {
  case '00000000cbe7b8a5':
    cameraId = 0;
    break;
  case '000000006c351194':
    cameraId = 1;
    break;
  case '00000000c7a13f5d':
    cameraId = 2;
    break;
  case '00000000a756dd26':
    cameraId = 3;
    break;
  case '00000000cb68f0cf':
    cameraId = 4;
    break;
  case '000000003b09e838':
    cameraId = 5;
    break;
}

var socket = io.connect('blvdia.herokuapp.com', {
  port: 80
});

socket.on('reboot', function(msg) {
  if (msg.cameraId === cameraId) {
    childProcess.exec('sudo reboot');
  }
});

socket.on('shutdown', function(msg) {
  if (msg.cameraId === cameraId) {
    childProcess.exec('sudo shutdown -h now');
  }
});

socket.on('shutter', function(msg) {
  if (msg.cameraId === cameraId) {
    start(msg.clientId);
  }
});

socket.on('preview', function(msg) {
  if (msg.cameraId === cameraId) {
    preview(msg.cameraId);
  }
})

var preview = function(cameraId) {
  var cmd = childProcess.exec(dir + 'preview.sh');
  cmd.on('exit', function() {
    var s3 = new AWS.S3();
    var body = fs.createReadStream(dir + 'preview.jpg');
    var timestamp = Date.now();
    var params = {
      Bucket: 'blvdia',
      Key: 'camera-' + cameraId + '/' + timestamp + '.jpg',
      ContentType: 'image/jpeg',
      Body: body
    };

    s3.putObject(params, function(err, data) {
      if (err) {
        console.log(err);
      } else {
        socket.emit('preview-complete', {
          cameraId: cameraId,
          url: 'https://s3-us-west-2.amazonaws.com/blvdia/camera-' + cameraId + '/' + timestamp + '.jpg'
        });
      }
    });
  });
};

var start = function(clientId) {
  var snapIndex = 0;
  var exec = childProcess.exec(dir + 'img.sh');

  exec.on('exit', function() {
    var s3 = new AWS.S3();
    var body = fs.createReadStream(dir + 'animation.gif');
    var params = {
      Bucket: 'blvdia',
      Key: 'passport-photo/' + clientId + '.gif',
      ContentType: 'image/gif',
      Body: body
    };

    s3.putObject(params, function(err, data) {
      if (err) {
        console.log(err);
      } else {
        socket.emit('complete', {
          clientId: clientId,
          url: 'https://s3-us-west-2.amazonaws.com/blvdia/passport-photo/' + clientId + '.gif'
        });
        childProcess.exec('rm ' + dir + 'animation.gif');
      }
    });
  });

  exec.stdout.on('data', function(data) {
    if (data.indexOf('snap') > -1) {
      childProcess.exec('omxplayer ' + dir + 'snap.wav');
      socket.emit('snap', {
        index: snapIndex,
        clientId: clientId
      });
      snapIndex++;
    }
  });
};

setInterval(function() {
  socket.emit('heartbeat', {
    cameraId: cameraId
  });
}, 5000);
