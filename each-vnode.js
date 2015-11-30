/*jslint node:true*/

'use strict';

var handleThunk = require('virtual-dom/vnode/handle-thunk');
var isVNode = require('virtual-dom/vnode/is-vnode');
var helpers = require('./helpers');

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

module.exports = function (vnode, cb) {
    if (!cb) {
        return;
    }
    eachVNode(vnode, cb);
};
