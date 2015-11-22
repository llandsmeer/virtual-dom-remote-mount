'use strict';

var VNode = require('virtual-dom/vnode/vnode');
var VText = require('virtual-dom/vnode/vtext');
var patch = require('virtual-dom/patch');
var createElement = require('virtual-dom/create-element');

function main() {

    var socket = io.connect();

    var target = document.getElementById('virtual-dom-remote-mount-target');
    var root = target.firstChild;

    socket.emit('virtual-dom-remote-mount:connect', _VIRTUALDOMREMOTEMOUNTID);

    socket.on('virtual-dom-remote-mount:patches', function (patches) {
        if (root != null) {
            root = patch(root, declone(patches));
        }
    });

}

function declone(obj) {
    var copy, key;
    if (obj == null || typeof obj !== 'object') {
        copy = obj;
    }
    else if (Array.isArray(obj)) {
        copy = [];
        for (key = 0; key < obj.length; key++) {
            copy.push(declone(obj[key]));
        }
    }
    else {
        if (obj.hasOwnProperty('proto')) {
            copy = Object.create(obj.proto);
        } else {
            copy = {};
        }
        for (key in obj) {
            if (key !== 'proto' && obj.hasOwnProperty(key)) {
                copy[key] = declone(obj[key]);
            }
        }
    }
    return copy;
}

document.addEventListener('DOMContentLoaded', main);
