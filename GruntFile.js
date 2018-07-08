

module.exports = function(grunt) {
    var browsers = [{
        browserName: "firefox",
        platform: "Windows 10"
    }, {
        browserName: "chrome",
        platform: "Windows 10"
    }, {
        browserName: "MicrosoftEdge",
        platform: "Windows 10"
    }, {
        browserName: "chrome",
        platform: "macOS 10.12"
    }, {
        browserName: "firefox",
        platform: "macOS 10.12"
    }, {
        browserName: "safari",
        platform: "macOS 10.12",
    }];

    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        connect: {
            server: {
                options: {
                    base: "",
                    port: 9999
                }
            }
        },

        "saucelabs-mocha": {
            all: {
                options: {
                    urls: [
                        "http://localhost:9999/test/browser/test.html"
                    ],
                    browsers: browsers,
                    build: process.env.TRAVIS_JOB_ID,
                    testname: "mocha tests",
                    throttled: 3,
                    sauceConfig: {
                        "video-upload-on-pass": false
                    }
                }
            }
        },
        watch: {}
    });

    grunt.loadNpmTasks("grunt-contrib-connect");
    grunt.loadNpmTasks("grunt-saucelabs");

    grunt.registerTask("default", ["connect", "saucelabs-mocha"]);
};
