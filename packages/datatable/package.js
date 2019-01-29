Package.describe({
    name: 'maclotsen:datatable',
    version: '0.0.1',
    // Brief, one-line summary of the package.
    summary: 'Meteor datatable with BlazeJS and Bootstrap 3',
    // URL to the Git repository containing the source code for this package.
    git: 'https://github.com/MacLotsen/meteor-datatable.git',
    // By default, Meteor will default to using README.md for documentation.
    // To avoid submitting documentation, set this field to null.
    documentation: 'README.md'
});

Package.onUse(function (api) {
    api.versionsFrom('1.8.0.1');
    api.use(['ecmascript', 'less', 'templating', 'mizzao:bootstrap-3'], 'client');
    // api.mainModule('datatable.js', 'client');
    api.addFiles(['datatable.js', 'datatable.less', 'datatable.html'], 'client', {isImport: true});
    //
    api.imply([
        // A library for reactive user interfaces
        'blaze@2.3.2',

        // The following packages are basically empty shells that just exist to
        // satisfy code checking for the existence of a package. Rest assured that
        // they are not adding any bloat to your bundle.
        'ui@1.0.12', // XXX COMPAT WITH PACKAGES BUILT FOR 0.9.0.
        'spacebars@1.0.15', // XXX COMPAT WITH PACKAGES BUILT FOR 0.9.0

        // Compile .html files into Blaze reactive views
        'templating@1.3.2'
    ]);
});

Package.onTest(function (api) {
    api.use('ecmascript');
    api.use('tinytest');
    api.use('maclotsen:datatable');
    api.mainModule('datatable-tests.js');
});
