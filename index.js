'use strict';
var exec = require('child_process').exec
  , fs = require('fs')
  , os = require('os')
  , through = require('through2')
  , async = require('async')
  , File = require('vinyl')
  , colors = require('colors')
  , logger = require('tracer').colorConsole({
    inspectOpt: {
      showHidden : true, //the object's non-enumerable properties will be shown too
      depth : 2 //tells inspect how many times to recurse while formatting the object. This is useful for inspecting large complicated objects. Defaults to 2. To make it recurse indefinitely pass null.
    },
    filters : {
      log : colors.white,
      trace : colors.magenta,
      debug : colors.cyan,
      info : colors.green,
      warn : colors.yellow,
      error : [ colors.red, colors.bold ]
    }
  })
  ;

module.exports = function (opts) {
  var fontInfo, fontFile;
  if (opts == undefined) {
    opts = {
      debug: false
    }
  }
  return function(filePath, enc, cb) {
    console.log('fileeeeee', filePath);
    async.series([
        function(callback){
          exec('fontforge -script "'+__dirname+'/otf2ttf.sh" "'+filePath+'" "'+os.tmpdir()+'"',
            function (error, stdout, stderr) {
              if (opts.debug === true) {
                console.log('stderr: ' + stderr);
              }
              if (error === null) {
                try {
                  fontInfo = JSON.parse(stdout);
                  callback(null, fontInfo);
                } catch (err) {
                  callback(err);
                }
              }
              else {
                console.error('exec error: '.bold, error);
              }
            });
        }],
      function(err, results){
        if (err) {
          return cb(err);
        }
        if (opts.debug === true) {
          console.log('Font info: \n'.green.bold, results[0]);
        }
        fontFile = new File({
          cwd: "/",
          base: os.tmpdir()+"/",
          path: os.tmpdir()+"/"+fontInfo.fontFile,
          contents: fs.readFileSync(os.tmpdir()+"/"+fontInfo.fontFile)
        });
        fontFile.data = fontInfo;
        // this.push(fontFile);
        return cb(null, fontFile);
      }.bind(this));
  };
};
