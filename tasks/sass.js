/*
 * grunt-contrib-sass
 * http://gruntjs.com/
 *
 * Copyright (c) 2013 Sindre Sorhus, contributors
 * Licensed under the MIT license.
 */
'use strict';

module.exports = function (grunt) {
  var path = require('path');
  var dargs = require('dargs');
  var numCPUs = require('os').cpus().length;

  grunt.registerMultiTask('sass', 'Compile Sass to CSS', function () {
    var cb = this.async();
    var options = this.options();
    var passedArgs = dargs(options, ['bundleExec']);
    var bundleExec = options.bundleExec;

    grunt.verbose.writeflags(options, 'Options');

    grunt.util.async.forEachLimit(this.files, numCPUs, function (file, next) {
      var src = file.src[0];
      if (typeof src !== 'string') {
        src = file.orig.src[0];
      }

      if (!grunt.file.exists(src)) {
        grunt.log.warn('Source file "' + src + '" not found.');
        return next();
      }

      var args = [
        src,
        file.dest,
        '--load-path', path.dirname(src)
      ].concat(passedArgs);

      if (process.platform === 'win32') {
        args.unshift('sass.bat');
      } else {
        args.unshift('sass');
      }

      if (bundleExec) {
        args.unshift('bundle', 'exec');
      }

      // If we're compiling scss or css files
      if (path.extname(src) === '.css') {
        args.push('--scss');
      }

      // Make sure grunt creates the destination folders
      grunt.file.write(file.dest, '');

      grunt.util.spawn({
        cmd: args.shift(),
        args: args,
        opts: {
          stdio: 'inherit'
        }
      }, function (error, result, code) {
        if (code === 127) {
          return grunt.warn(
            'You need to have Ruby and Sass installed and in your PATH for\n' +
            'this task to work. More info:\n' +
            'https://github.com/gruntjs/grunt-contrib-sass'
          );
        }

        next(error);
      });
    }, cb);
  });
};
