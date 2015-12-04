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

function elementIndex(elem) {
    var prevElem, i = -1;
    while (elem !== null) {
        elem = elem.previousElementSibling;
        i += 1;
    }
    return i;
}

function elementPath(elem, root) {
    var path = [];
    root = root || null;
    while (elem !== root) {
        path.unshift(elementIndex(elem));
        elem = elem.parentNode;
    }
    return path;
}

function main() {
    var socket, target, root;
    socket = io.connect();
    target = document.getElementById('virtual-dom-remote-mount-target');
    root = target.firstChild;
    function handleEvent(e) {
        var eventPath = elementPath(e.target, root).join('.') + ':' + e.type;
        socket.emit('virtual-dom-remote-mount:event', eventPath);
    }
    socket.emit('virtual-dom-remote-mount:connect', VIRTUALDOMREMOTEMOUNTID);
    socket.on('virtual-dom-remote-mount:update', function (update) {
        var i, eventName, createEvents, removeEvents;
        createEvents = update.events.subscribe;
        removeEvents = update.events.unsubscribe;
        for (i = 0; i < createEvents.length; i += 1) {
            eventName = createEvents[i];
            root.addEventListener(eventName, handleEvent);
        }
        for (i = 0; i < removeEvents.length; i += 1) {
            eventName = removeEvents[i];
            root.removeEventListener(eventName, handleEvent);
        }
        if (update.patches) {
            root = patch(root, declone(update.patches));
        }
    });
}

document.addEventListener('DOMContentLoaded', main);

})();
