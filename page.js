/*jslint node:true*/

'use strict';

var diff = require('virtual-dom/diff');
var vdomToHtml = require('vdom-to-html');

function Page() {
    this.state = {};
    this.init();
}

/*jslint unparam: true*/
Page.prototype.render = function (state) {
    throw 'render() not implemented';
};

Page.prototype.init = function (state) {
    return;
};
/*jslint unparam: false*/

Page.prototype.setState = function (nextState) {
    if (typeof nextState === 'function') {
        nextState = nextState(this.state);
    }
    if (typeof nextState !== 'object') {
        throw 'nextState is not or does not return an object';
    }
    copy(this.state, nextState);
    this.forceUpdate();
};

Page.prototype.replaceState = function (nextState) {
    this.state = {};
    this.setState(nextState);
};

Page.prototype.createTree = function () {
    return this.render(this.state);
};

Page.prototype.forceUpdate = function () {
    this.nextTree(this.createTree());
};

Page.prototype.nextTree = function (nextTree) {
    if (!this.ioSocket) {
        return;
    }
    if (this.tree === undefined) {
        this.sendTree(nextTree);
    } else {
        this.sendPatches(diff(this.tree, nextTree));
    }
    this.tree = nextTree;
};

Page.prototype.sendTree = function (tree) {
    if (this.ioSocket) {
        this.ioSocket.emit('virtual-dom-remote-mount:tree',
            semiclone(tree));
    }
};

Page.prototype.sendPatches = function (patches) {
    if (this.ioSocket) {
        this.ioSocket.emit('virtual-dom-remote-mount:patches',
            semiclone(patches));
    }
};

Page.prototype.mountSocketIo = function (socket) {
    if (this.ioSocket) {
        throw 'socket already mounted';
    }
    this.ioSocket = socket;
    socket.on('error', console.error.bind(console));
};

Page.prototype.initialHtml = function () {
    this.tree = this.createTree();
    return vdomToHtml(this.tree);
};

module.exports = Page;

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
