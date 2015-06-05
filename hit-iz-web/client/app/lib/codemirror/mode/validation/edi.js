/**
 * edi.js
 *
 * Building upon and improving the CodeMirror 2 XML parser
 * @author: Harold AFFO
 * @date: 31 July, 2012
 */

CodeMirror.defineMode("validation", function (config, parserConfig) {
    return {
        token: function (stream, state) {

        }
    };
});

CodeMirror.defineMIME("text/validation", "validation");
