/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    // Metadata.

    //checkout panel and presentation modules


    //merge ambiguous files

    pkg: grunt.file.readJSON('package.json'),
    banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
      ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',
    // Task configuration.
    concat: {
      options: {
        banner: '<%= banner %>',
        stripBanners: true
      },
      basic_and_extras: {
        files: {
          'js/panel/dist/onslyde-panel-1.0.0.js': ['js/panel/onslyde-1.0.0.panel.js'],
          'js/panel/dist/onslyde-remote-1.0.0.js': ['js/panel/panel-remote.js',
            'js/panel/gplus-oauth.js',
            'js/panel/gracefulWebSocket.js',
            'js/panel/fastclick.min.js']
        }
      }
    },
    uglify: {
      options: {
        banner: '<%= banner %>'
      },
      primary : {
        files: {
          'js/panel/dist/onslyde-remote-1.0.0.min.js': ['js/panel/dist/onslyde-remote-1.0.0.js'],
          'js/panel/dist/onslyde-panel-1.0.0.min.js': ['js/panel/dist/onslyde-panel-1.0.0.js']
        }
      }
    },
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        unused: false,
        boss: true,
        eqnull: true,
        globals: {
          jQuery: true,
          'gapi' : true,
          '_gaq': true,
          'speak': true,
          'ws': true,
          window: true,
          document: true,
          onslyde: true,
          userObject: true,
          localStorage: true,
          WebSocket: true,
          setTimeout: true,
          clearTimeout: true,
          setInterval: true,
          clearInterval: true,
          XMLHttpRequest: true,
          location: true,
          console: true,
          navigator: true,
          getAttendees: true
        }
      },
      gruntfile: {
        src: 'Gruntfile.js'
      },
      lib_test: {
        src: ['js/panel/*.js']
      }
    }

  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.loadNpmTasks('grunt-shell');

  // Default task.
  grunt.registerTask('default', ['jshint', 'concat', 'uglify']);

};
