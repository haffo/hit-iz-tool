if (typeof String.prototype.startsWith != 'function') {
    String.prototype.startsWith = function (str) {
        return this.slice(0, str.length) == str;
    };
}


if (typeof String.prototype.endsWith != 'function') {
    String.prototype.endsWith = function (str) {
        return this.slice(-str.length) == str;
    };
}


var mod = angular.module('hit-util',[]);
mod.factory('XMLUtil',
    [function () {
        var xml_special_to_escaped_one_map = {
            '&': '&',
            '"': '"',
            '&lt;': '&lt;',
            '>': '&gt;'
        };
        var escaped_one_to_xml_special_map = {
            '&': '&',
            '"': '"',
            '&lt;': '&lt;',
            '&gt;': '>'
        };
        var XMLUtil = {

            encodeXml: function (string) {
//                return string.replace(/([\&"&lt;>])/g, function (str, item) {
//                    return xml_special_to_escaped_one_map[item];
//                });
                return string.replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&apos;');
            },

            decodeXml: function (string) {
//                return string.replace(/("|&lt;|&gt;|&)/g,
//                    function (str, item) {
//                        return escaped_one_to_xml_special_map[item];
//                    });
                return string.replace(/&apos;/g, "'")
                    .replace(/&quot;/g, '"')
                    .replace(/&gt;/g, '>')
                    .replace(/&lt;/g, '<')
                    .replace(/&amp;/g, '&');

            }
        };

        return XMLUtil;
    }]);

mod.factory('MessageUtil',
    [function () {
        var MessageUtil = {
            toHexadecimal: function (message) {
                var has = false;
                var out = "";
                var cs = message.split('');
                for (var i = 0; i < cs.length; i++) {
                    var c = cs[i];
                    if (MessageUtil.isPrintable(c)) {
                        out += c;
                    } else {
                        //var hex = c.charCodeAt(0).toString(16);
//                        var hex = ("0000" + c.charCodeAt(0).toString(4)).substr(-4);
                        var hex = ("0000" + (+c.charCodeAt(0)).toString(16)).slice(-4);
//                        var hex = ("0000" +c.charCodeAt(0).toString(4));
                        out += "[x" + hex + "]";
                    }
                }
                return out;
            },
            hasNonPrintable: function (message) {
                        var has = false;
                        var cs = message.split('');
                        for (var i = 0; i < cs.length; i++) {
                            if (!MessageUtil.isPrintable(cs[i])) {
                                has = true;
                                break;
                            }
                        }
                        return has;
//                return message != null && message != "" ? MessageUtil.isPrintable(message) : false;
            },

            isPrintable: function (c) {
                var i = c.charCodeAt(0);
                return i == 10 || i < 0 || i > 31;
//
//                return /[\x00-\x08\x0E-\x1F]/.test(c);
            }
        };
        return MessageUtil;
    }]);
