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
    var dst, i;
    if (src === null || src === undefined) {
        dst = src;
    } else if (Array.isArray(src)) {
        dst = [];
        for (i = 0; i < src.length; i++) {
            if (preprocess) {
                dst.push(preprocess(src[i]));
            } else {
                dst.push(src[i]);
            }
        }
    } else if (typeof src === 'object') {
        dst= {};
        copy(dst, src, preprocess);
    } else {
        dst = src;
    }
    return dst;
}

function isSimpleObject(obj) {
    return obj !== null &&
           obj !== undefined &&
           !Array.isArray(obj) &&
           typeof obj === 'object';
}

function semiclone(obj) {
    var objclone, proto;
    objclone = clone(obj, semiclone);
    if (isSimpleObject(obj)) {
        proto = Object.getPrototypeOf(obj);
        if (proto !== undefined && Object.keys(proto).length > 0) {
            objclone.proto = clone(proto);
        }
    }
    return objclone;
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

function difference(newContainer, oldContainer) {
    var created = [];
    var deleted = [];
    if (newContainer) {
        newContainer.forEach(function (_, newKey) {
            if (oldContainer === undefined || !oldContainer.has(newKey)) {
                created.push(newKey);
            }
        });
    }
    if (oldContainer) {
        oldContainer.forEach(function (_, oldKey) {
            if (newContainer === undefined || !newContainer.has(oldKey)) {
                deleted.push(oldKey);
            }
        });
    }
    return {
        created: created,
        deleted: deleted
    };
}

module.exports.copy = copy;
module.exports.clone = clone;
module.exports.semiclone = semiclone;
module.exports.compileJavascript = compileJavascript;
module.exports.streamToString = streamToString;
module.exports.difference = difference;
module.exports.vdom = require('./virtual-dom-helpers.js');
