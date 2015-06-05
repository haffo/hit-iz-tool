// Karma configuration
// http://karma-runner.github.io/0.10/config/configuration-file.html

module.exports = function (config) {
    config.set({
        // base path, that will be used to resolve files and exclude
        basePath: '',

        // testing framework to use (jasmine/mocha/qunit/...)
        frameworks: ['jasmine'],

        // list of files / patterns to load in the browser
        files: [
            'app/bower_components/jquery/jquery.js',
            'app/bower_components/angular/angular.js',
            'app/bower_components/angular-mocks/angular-mocks.js',
            'app/bower_components/angular-resource/angular-resource.js',
            'app/bower_components/angular-cookies/angular-cookies.js',
            'app/bower_components/angular-sanitize/angular-sanitize.js',
            'app/bower_components/angular-route/angular-route.js',
            'app/bower_components/angular-bootstrap/ui-bootstrap.js',
            'app/bower_components/angular-animate/angular-animate.min.js',
            'app/bower_components/angular-loading-bar/build/loading-bar.min.js',
            'app/lib/blueimp-file-upload/js/vendor/jquery.ui.widget.js',
            'app/lib/blueimp/blueimp-file-upload/js/jquery.iframe-transport.js',
            'app/lib/blueimp/blueimp-file-upload/js/jquery.fileupload.js',
            'app/lib/blueimp/blueimp-file-upload/js/jquery.fileupload-process.js',
            'app/lib/blueimp/blueimp-file-upload/js/jquery.fileupload-image.js',
            'app/lib/blueimp/blueimp-file-upload/js/jquery.fileupload-audio.js',
            'app/lib/blueimp/blueimp-file-upload/js/jquery.fileupload-video.js',
            'app/lib/blueimp/blueimp-file-upload/js/jquery.fileupload-validate.js',
            'app/lib/blueimp/blueimp-file-upload/js/jquery.fileupload-angular.js',
            'app/scripts/*.js',
//      'app/assets/**/*.js',
            'app/scripts/**/*.js',
//      'test/mock/**/*.js',
            'test/spec/**/*.js'
        ],

        // list of files / patterns to exclude
        exclude: [],

        // web server port
        port: 8080,

        // level of logging
        // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
        logLevel: config.LOG_INFO,


        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: false,


        // Start these browsers, currently available:
        // - Chrome
        // - ChromeCanary
        // - Firefox
        // - Opera
        // - Safari (only Mac)
        // - PhantomJS
        // - IE (only Windows)
        browsers: ['PhantomJS'],


        // Continuous Integration mode
        // if true, it capture browsers, run tests and exit
        singleRun: false
    });
};
