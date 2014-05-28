var lodash = require('lodash');

module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),   
    
    concurrent: {
      devel: {
        tasks: ['connect', 'watch'],
        options: {
          limit: 2,
          logConcurrentOutput: true
        }
      },
      site: {
        tasks: ['connect'],
        options: {
          limit: 2,
          logConcurrentOutput: true
        }
      },
      all: {
        tasks: ['connect', 'watch'],
        options: {
          limit: 3,
          logConcurrentOutput: true
        }
      }
    },

    watch: {
      all: {
        files: "src/**/*",
        tasks: ["build"]
      }
    },
    
    connect: {
      server: {
        options: {
          hostname: '0.0.0.0',
          port: 3000,
          base: ['site/output', '.'],
          keepalive: true
        }
      }
    },
    
  });
  
  grunt.loadNpmTasks("grunt-contrib-connect");
  grunt.loadNpmTasks("grunt-contrib-watch");
  grunt.loadNpmTasks("grunt-concurrent");
  //grunt.task.loadTasks("tasks");

  grunt.registerTask("default", 
                                ["concurrent:all"]);

};
