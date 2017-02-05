'use strict';

module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        karma: {
            options: {
                configFile: 'karma.conf.js'
            },
            version: {
                basePath: 'build'
            },
            latest: {
                basePath: '.'
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
                    cwd: 'build',
                    src: '**/*.js',
                    dest: 'build'
                }]
            }
        },
        clean: ['build'],
        copy: {
            main: {
                files: [{
                    cwd: '.',
                    src: [
                        'src/img/*.jpg',
                        'src/img/*.gif',
                        'src/img/*.png',
                        'src/resources/**/*'
                    ],
                    dest: 'build',
                    expand: true
                }, {
                    cwd: '.',
                    src: [
                        'src/*.html',
                    ],
                    dest: 'build',
                    expand: true
                }, {
                    cwd: '.',
                    src: [
                        'src/latest/**/*.xml',
                        'src/latest/**/*.js',
                        'src/latest/**/*.json',
                        'src/**/*.properties',
                        'src/latest/**/*.css'
                    ],
                    dest: '<%= pkg.version %>',
                    expand: true,
                    rename: function(dest, src) {
                        var version = dest;
                        var topdir = src.replace(/latest/g, dest);
                        return 'build/' + topdir;
                    }
                }]
            }
        },
        'string-replace': {
            dist: {
                files: {
                    cwd: 'build',
                    './': [
                        'build/*.html',
                        'build/<%= pkg.version %>/service/i18n.js',
                        'build/<%= pkg.version %>/test/service/i18nTest.js',
                        'build/<%= pkg.version %>/test/ui5-bootstrap.js',
                        'build/<%= pkg.version %>/view/*.controller.js',
                        'build/<%= pkg.version %>/controller/*.controller.js',
                        'build/<%= pkg.version %>/controllers/*.controller.js'
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
                    }, {
                        pattern: /"latest\/css\/custom.css/ig,
                        replacement: '"<%= pkg.version %>/css/custom.css'
                    }]
                }
            }
        }
    });
    grunt.loadNpmTasks('grunt-nwabap-ui5uploader');
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
    grunt.registerTask('publish', ['default', 'nwabap_ui5uploader']);
}

