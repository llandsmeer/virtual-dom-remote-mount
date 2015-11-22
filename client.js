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
            root = patch(root, patches);
        }
    });

}

document.addEventListener('DOMContentLoaded', main);
