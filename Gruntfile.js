module.exports = function(grunt) {

    "use strict";

    grunt.initConfig({

        jasmine: {
            core: {
                src: "source/archetype.js",
                options: {
                    specs: [
                        "tests/init.spec.js",
                        "tests/core/**/*.js"
                    ]
                }
            }
        },

        jshint: {
            source: [
                "source/**/*.js"
            ]
        }

    });

    require('load-grunt-tasks')(grunt);

    grunt.registerTask("default", ["build"]);

    grunt.registerTask("test", [
        "jshint:source",
        "jasmine:core"
    ]);

};
