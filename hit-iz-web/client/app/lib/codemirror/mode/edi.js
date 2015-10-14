/**
 * edi.js
 *
 * Building upon and improving the CodeMirror 2 XML parser
 * @author: Harold AFFO
 * @date: 31 July, 2012
 */

CodeMirror.defineMode("edi", function (config, parserConfig) {
//    var tab = [ '|', '^', '&', '~' ];
//    var config.separators = new Array(4);
//    config.separators['field_separator'] = tab[0];
//    config.separators['component_separator'] = tab[1];
//    config.separators['subcomponent_separator'] = tab[2];
//    config.separators['continuation_separator'] = tab[3];

    return {
        token: function (stream, state) {
            var ch = stream.next();
            if (stream.column() <= 2) {
                return "segment-name";
            } else {
                if (parserConfig.separators != null) {
                    if (ch == parserConfig.separators.field_separator) {
                        return "field-separator";
                    }
                    if (ch == parserConfig.separators.component_separator) {
                        return "component-separator";
                    }
                    if (ch == parserConfig.separators.subcomponent_separator) {
                        return "subcomponent-separator";
                    }
                    if (ch == parserConfig.separators.continuation_separator) {
                        return "continuation-separator";
                    }
                } else {
                    return "";
                }
            }
        }
    };
});

CodeMirror.defineMIME("text/edi", "edi");
