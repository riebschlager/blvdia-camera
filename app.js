var cameraId;
var dir = '/home/pi/blvdia-camera/';

var AWS = require('aws-sdk');
var CP = require('child_process');
var FS = require('fs');
var IO = require('socket.io-client');

var serialResult = CP.execSync('python ' + dir + 'serial.py');
var serial = serialResult.toString();

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

var socket = IO.connect('blvdia.herokuapp.com', {
  port: 80
});

socket.on('deploy', function() {
  CP.execSync('cd ' + dir + ' && git pull');
  CP.exec('sudo reboot');
});

socket.on('reboot', function(msg) {
  if (msg.cameraId === cameraId) {
    CP.exec('sudo reboot');
  }
});

socket.on('shutdown', function(msg) {
  if (msg.cameraId === cameraId) {
    CP.exec('sudo shutdown -h now');
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

function preview(cameraId) {
  var cmd = CP.exec(dir + 'preview.sh');
  var timestamp = Date.now();
  cmd.on('exit', function() {
    var body = FS.createReadStream(dir + 'preview.jpg');
    var s3 = new AWS.S3({
      params: {
        Bucket: 'blvdia-camera-' + cameraId,
        Key: timestamp + '.jpg',
        ContentType: 'image/jpeg',
        Body: body
      }
    });
    s3.upload().send(function() {
      socket.emit('preview-complete', {
        cameraId: cameraId,
        url: 'https://s3-us-west-2.amazonaws.com/blvdia-camera-' + cameraId + '/' + timestamp + '.jpg'
      });
    });
  });
};

function start(clientId) {
  var snapIndex = 0;
  var exec = CP.exec(dir + 'img.sh');

  exec.on('exit', function() {
    var body = FS.createReadStream(dir + 'animation.mp4');
    var s3 = new AWS.S3({
      params: {
        Bucket: 'blvdia-passport',
        Key: clientId + '.mp4',
        ContentType: 'video/mp4',
        Body: body
      }
    });

    s3.upload().send(function() {
      socket.emit('complete', {
        clientId: clientId,
        url: 'https://s3-us-west-2.amazonaws.com/blvdia-passport/' + clientId + '.mp4'
      });
      CP.exec('rm ' + dir + 'animation.mp4');
    });
  });

  exec.stdout.on('data', function(data) {
    if (data.indexOf('snap') > -1) {
      CP.exec('omxplayer ' + dir + 'snap.wav');
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
    cameraId: cameraId,
    time: Date.now()
  });
}, 1000);
