'use strict';

module.exports = function(grunt) {

    // Load all grunt tasks.
    require('load-grunt-tasks')(grunt);

    // Project Configuration.
    var projectConfig = {
        app: 'app',
        pub: 'public',
        dist: 'dist'
    };

    // Create the tasks of the config.
    grunt.initConfig({
        projectConfig: projectConfig,
        clean: {
            contents: ['public/build/']
        },
        browserify: {
            dist: {
                options: {
                    transform: [
                        ['babelify', require('browserify-istanbul')]
                    ]
                },
                files: {
                    // Transform all files to es5 and concats them into one single file
                    'public/build/bundle.js': ['public/components/**/*.js', 'public/services/*.js']
                }
            }
        },
        watch: {
            js: {
                files: ['public/components/**/*.js', 'public/components/**/**/*.js', 'public/services/*.js', 'public/constants/*.js', 'app/**/*.js'],
                options: {
                    livereload: true,
                },
                tasks: ['clean', 'browserify']
            },
            html: {
                files: ['public/views/**', 'app/views/**'],
                options: {
                    livereload: true,
                },
            },
            css: {
                files: ['public/styles/*.scss'],
                tasks: ['compass'],
                options: {
                    livereload: true
                }
            }
        },
        nodemon: {
            dev: {
                script: 'server.js',
                options: {
                    args: [],
                    ignoredFiles: ['README.md', 'node_modules/**', '.DS_Store'],
                    watchedExtensions: ['js'],
                    watchedFolders: ['app', 'config'],
                    debug: true,
                    delayTime: 1,
                    env: {
                        PORT: 3000
                    },
                    cwd: __dirname
                }
            }
        },
        compass: {
            options: {
                sassDir: '<%= projectConfig.pub %>/styles',
                cssDir: '<%= projectConfig.pub %>/styles',
                relativeAssets: true
            },
            dist: {},
            server: {
                options: {
                    debugInfo: true
                }
            }
        },
        concurrent: {
            tasks: ['nodemon', 'watch'],
            options: {
                logConcurrentOutput: true
            }
        }
    });

    //Making grunt default to force in order not to break the project.
    grunt.option('force', true);

    //Default task(s).
    grunt.registerTask('serve', function(target) {
        grunt.task.run([
            'clean',
            'browserify',
            'compass',
            'concurrent'
        ]);
    });

};
