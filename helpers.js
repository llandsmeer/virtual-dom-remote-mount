/*jslint node:true*/

'use strict';

var path = require('path');
var browserify = require('browserify');

function copy(dst, src, preprocess) {
    var key;
    for (key in src) {
        if (src.hasOwnProperty(key)) {
            if (preprocess) {
                dst[key] = preprocess(src[key]);
            } else {
                dst[key] = src[key];
            }
        }
    }
}

function clone(src, preprocess) {
    var dst = {};
    copy(dst, src, preprocess);
    return dst;
}

function semiclone(obj) {
    var i, objclone;
    if (obj === null || obj === undefined) {
        return obj;
    }
    if (Array.isArray(obj)) {
        objclone = [];
        for (i = 0; i < obj.length; i += 1) {
            objclone.push(semiclone(obj[i]));
        }
        return objclone;
    }
    if (typeof obj === 'object') {
        objclone = clone(obj, semiclone);
        if (obj.__proto__ != null) {
            objclone.proto = clone(obj.__proto__);
        }
        return objclone;
    }
    return obj;
}

function streamToString(stream, cb) {
    var result = '';
    stream.on('data', function (buffer) {
        result += buffer.toString();
    });
    stream.on('end', function () {
        cb(result);
    });
}

function compileJavascript(filename, cb, bindTo) {
    var bundle;
    bundle = browserify(path.join(__dirname, filename)).bundle();
    streamToString(bundle, cb.bind(bindTo));
}

module.exports.copy = copy;
module.exports.clone = clone;
module.exports.semiclone = semiclone;
module.exports.compileJavascript = compileJavascript;
module.exports.streamToString = streamToString;
