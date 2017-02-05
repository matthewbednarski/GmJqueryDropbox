'use strict';

module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        karma: {
            options: {
                configFile: 'karma.conf.js'
            },
            version: {
                basePath: 'dist'
            },
            latest: {
                basePath: 'test'
            }
        },
        jshint: {
            all: ['Gruntfile.js', 'src/**/*.js', 'test/**/*.js']
        },
        uglify: {
            options: {
                mangle: true
            },
            main_target: {
                files: [{
                    expand: true,
                    cwd: 'dist',
                    src: '**/*.js',
                    dest: 'dist'
                }]
            }
        },
        clean: ['dist'],
        copy: {
            main: {
                files: [{
                    cwd: '.',
                    src: [
                        'src/**/*.html',
                        'src/**/*.js',
                        'src/**/*.css',
                        'src/**/*.xml',
                        'src/**/*.json',
                        'src/**/*.properties',
                        'src/**/*.svg',
                        'src/**/*.jpg',
                        'src/**/*.gif',
                        'src/**/*.png'
                    ],
                    dest: '<%= pkg.version %>',
                    expand: true,
                    rename: function(dest, src) {
                        var version = dest;
                        var topdir = src.replace(/src/g, dest);
                        return 'dist/' + topdir;
                    }
                }]
            }
        },
        'string-replace': {
            dist: {
                files: {
                    cwd: 'dist',
                    './': [
                        'dist/<%= pkg.version %>/**/*.html',
                        'dist/<%= pkg.version %>/**/*.js',
                        'dist/<%= pkg.version %>/**/*.css',
                        'dist/<%= pkg.version %>/**/*.json',
                        'dist/<%= pkg.version %>/**/*.xml'
                    ]
                },
                options: {
                    replacements: [{
                        pattern: /\/latest\//g,
                        replacement: '/<%= pkg.version %>/'
                    }, {
                        pattern: /'latest\//ig,
                        replacement: '\'<%= pkg.version %>/'
                    }, {
                        pattern: /"latest\//ig,
                        replacement: '"<%= pkg.version %>/'
                    }]
                }
            }
        }
    });
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-string-replace');
    grunt.loadNpmTasks('grunt-karma');
    grunt.registerTask('test-latest', ['karma:latest']);
    grunt.registerTask('test-version', ['clean', 'copy', 'string-replace', 'uglify', 'karma:version']);
    grunt.registerTask('test', ['karma:latest']);
    grunt.registerTask('default', ['test-latest', 'test-version']);
    grunt.registerTask('publish', ['default']);
}

