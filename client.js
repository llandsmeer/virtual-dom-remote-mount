/*jslint browser: true*/
/*globals io, VIRTUALDOMREMOTEMOUNTID*/

(function() {

'use strict';

var VNode = require('virtual-dom/vnode/vnode');
var VText = require('virtual-dom/vnode/vtext');
var patch = require('virtual-dom/patch');
var createElement = require('virtual-dom/create-element');

function declone(obj) {
    var copy, key, i;
    if (obj === null || obj === undefined || typeof obj !== 'object') {
        copy = obj;
    } else if (Array.isArray(obj)) {
        copy = [];
        for (i = 0; i < obj.length; i += 1) {
            copy.push(declone(obj[i]));
        }
    } else {
        if (obj.hasOwnProperty('proto')) {
            copy = Object.create(obj.proto);
        } else {
            copy = {};
        }
        for (key in obj) {
            if (obj.hasOwnProperty(key) && key !== 'proto') {
                copy[key] = declone(obj[key]);
            }
        }
    }
    return copy;
}

function main() {
    var socket, target, root;
    socket = io.connect();
    target = document.getElementById('virtual-dom-remote-mount-target');
    root = target.firstChild;
    socket.emit('virtual-dom-remote-mount:connect', VIRTUALDOMREMOTEMOUNTID);
    socket.on('virtual-dom-remote-mount:patches', function (patches) {
        console.log(declone(patches));
        if (root !== null) {
            root = patch(root, declone(patches));
        }
    });
}

document.addEventListener('DOMContentLoaded', main);

})();
