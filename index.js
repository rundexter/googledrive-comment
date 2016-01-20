var _ = require('lodash'),
    util = require('./util.js'),
    google = require('googleapis'),
    service = google.drive('v3');

var fieldsFromApi = 'anchor,author,content,createdTime,deleted,htmlContent,id,kind,modifiedTime,quotedFileContent,replies,resolved';
var pickInputs = {
        'fileId': { key: 'fileId', validate: { req: true } },
        'anchor': { key: 'resource.anchor' },
        'content': { key: 'resource.content' },
        'quotedFileContent': { key: 'quotedFileContent.value' }
    },
    pickOutputs = {
        'id': 'id',
        'kind': 'kind',
        'author': 'author',
        'content': 'content',
        'deleted': 'deleted',
        'modifiedTime': 'modifiedTime'
    };

module.exports = {
    /**
     * The main entry point for the Dexter module
     *
     * @param {AppStep} step Accessor for the configuration for the step using this module.  Use step.input('{key}') to retrieve input data.
     * @param {AppData} dexter Container for all data used in this workflow.
     */
    run: function(step, dexter) {
        var OAuth2 = google.auth.OAuth2,
            oauth2Client = new OAuth2(),
            cretentials = dexter.provider('google').credentials();
        var inputs = util.pickInputs(step, pickInputs),
            validateErrors = util.checkValidateErrors(inputs, pickInputs);

        if (validateErrors)
            return this.fail(validateErrors);

        // set credential
        oauth2Client.setCredentials({
            access_token: _.get(cretentials, 'access_token')
        });
        google.options({ auth: oauth2Client });

        inputs.fields = fieldsFromApi;
        service.comments.create(inputs, function (error, data) {
            if (error)
                this.fail(error);
             else
                this.complete(util.pickOutputs(data, pickOutputs));
        }.bind(this));
    }
};
