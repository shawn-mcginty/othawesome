var gulp = require('gulp');
var sass = require('gulp-ruby-sass');
var prefix = require('gulp-autoprefixer');
var uglify = require('gulp-uglify');
var gulpConcat = require('gulp-concat');
var clean = require('gulp-clean');

gulp.task('default', ['copy-jquery', 'copy-materialize-js', 'copy-angular', 'copy-rx', 'compile-js', 'compile-sass']);

gulp.task('compile-sass', function () {
    return sass('stylesheets/othello.scss',{sourcemap: true, style: 'compact'})
        .pipe(prefix("last 1 version", "> 1%", "ie 8", "ie 7"))
        .pipe(gulp.dest('public/stylesheets'));
});

gulp.task('copy-jquery', function() {
	gulp.src('bower_components/jquery/dist/jquery.min.js')
		.pipe(gulp.dest('public/javascripts'));
});

gulp.task('copy-materialize-js', function() {
	gulp.src('bower_components/materialize/dist/js/materialize.min.js')
		.pipe(gulp.dest('public/javascripts'));
});

gulp.task('compile-js', function() {
	gulp.src(['node_modules/utils-belt-js/utils/**/*.js', 'app/ngApp.js', 'app/global/**/*.js', 'app/controllers/**/*.js'])
		.pipe(gulpConcat('app.js'))
		.pipe(gulp.dest('public/javascripts'));
});

gulp.task('copy-rx', function(){
	gulp.src('bower_components/rxjs/dist/rx.all.js')
		.pipe(gulp.dest('public/javascripts'));
});

gulp.task('copy-angular', function(){
	gulp.src(['bower_components/angular/angular.js', 'bower_components/angular-cookies/angular-cookies.js'])
	  .pipe(gulp.dest('public/javascripts'));
});

gulp.task('clean', function() {
	gulp.src(['public/stylesheets/othello*.*', 'public/javascripts/**/*'])
		.pipe(clean());
});