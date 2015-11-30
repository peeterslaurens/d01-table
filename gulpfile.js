'use strict';

var plugins = require('gulp-load-plugins')({
        camelize: true
    }),
    gulp = require('gulp'),
    devRoot = './dev',
    srcRoot = './src',
    distRoot = './dist';


    /**
     * Generate templatecache
     */
    gulp.task('templateCache', function() {
        return gulp.src(devRoot+'/**/*.html')
            .pipe(plugins.angularTemplatecache({module:'d01-table'}))
            .pipe(gulp.dest(devRoot));
    });

    gulp.task('concat', function() {
        return gulp.src(devRoot+'/**/*.js')
            .pipe(plugins.concat('d01-table.js'))
            .pipe(gulp.dest(srcRoot));
    });

    gulp.task('concat-dist', function() {
        return gulp.src(devRoot+'/**/*.js')
            .pipe(plugins.concat('d01-table.js'))
            .pipe(plugins.uglify())
            .pipe(gulp.dest(distRoot));
    });

    gulp.task('default', ['templateCache'], function(){});

    gulp.task('build', ['templateCache', 'concat-dist'], function(){});