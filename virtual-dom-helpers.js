/*jslint node:true*/

'use strict';

var handleThunk = require('virtual-dom/vnode/handle-thunk');
var isVNode = require('virtual-dom/vnode/is-vnode');
var helpers = require('./helpers');

var ON_EVENTS = new Set([
        'blur',
        'change',
        'click',
        'dblclick',
        'focus',
        'keydown',
        'keypress',
        'mousedown',
        'mousemove',
        'mouseout',
        'mouseover',
        'mouseup',
        'reset',
        'select',
        'submit'
]);

function eachVNode(vnode, cb, path) {
    var i, children, childPath;
    path = path || [];
    vnode = handleThunk(vnode).a;
    if (!isVNode(vnode)) {
        return;
    }
    cb(vnode, path);
    children = vnode.children;
    for (i = 0; i < children.length; i += 1) {
        childPath = helpers.clone(path);
        childPath.push(i);
        eachVNode(children[i], cb, childPath);
    }
}

function parseEventName(name) {
    var eventNameCandidate;
    if (name.startsWith('ev-')) {
        return name.substr(3) || null;
    }
    if (name.startsWith('on')) {
        eventNameCandidate = name.substr(2);
        if (ON_EVENTS.has(eventNameCandidate)) {
            return eventNameCandidate;
        }
    }
    return null;
}

function popEventProps(root, cb) {
    eachVNode(root, function(vnode, path) {
        var key, eventName;
        for (key in vnode.properties) {
            if (vnode.properties.hasOwnProperty(key)) {
                eventName = parseEventName(key);
                if (eventName !== null) {
                    vnode.properties[key] = undefined;
                    cb(eventName, path);
                }
            }
        }
    });
}

module.exports.each = function (vnode, cb) {
    if (!cb) {
        return;
    }
    eachVNode(vnode, cb);
};
module.exports.popEvents = popEventProps;
