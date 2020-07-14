var gulp = require('gulp');
var ts = require('gulp-typescript');
var tsProject = ts.createProject('tsconfig.json');

// gulp.task('default', function () {
//     return tsProject.src()
//         .pipe(tsProject())
//         .js.pipe(gulp.dest('./www/js'));
// });

gulp.task('build_typescript', function () {
    return tsProject.src()
        .pipe(tsProject())
        .js.pipe(gulp.dest('./www/app'));
});


gulp.task('copy_statics', function () {
    return gulp.src(
        ['statics/**'],
        // ['statics/*.html', 'statics/css/**', 'statics/js/*.js'],
        { base: 'statics' }
    )
        .pipe(gulp.dest('www'));
});

gulp.task('default', gulp.series('copy_statics', 'build_typescript', function(done) {
    console.log('task default');
    done();
}));