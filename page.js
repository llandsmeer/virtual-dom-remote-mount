var diff = require('virtual-dom/diff');
var vdomToHtml = require('vdom-to-html');

function Page() {
    this.state = {};
    this.init();
}

Page.prototype.render = function(state) {
};

Page.prototype.init = function(state) {
};

Page.prototype.setState = function(nextState) {
    if (typeof nextState === 'function') {
        nextState = nextState(this.state);
    }
    if (typeof nextState !== 'object') {
        throw 'nextState is not or does not return an object';
    }
    copy(this.state, nextState);
    this.forceUpdate();
};

Page.prototype.replaceState = function(nextState) {
    this.state = {};
    this.setState(nextState);
};

Page.prototype.createTree = function() {
    return this.render(this.state);
};

Page.prototype.forceUpdate = function() {
    this._nextTree(this.createTree());
};

Page.prototype._nextTree = function(nextTree) {
    if (!this.ioSocket) {
        return;
    }
    if (this._tree === undefined) {
        this._sendTree(nextTree);
    } else {
        this._sendPatches(diff(this._tree, nextTree));
    }
    this._tree = nextTree;
};

Page.prototype._sendTree = function(tree) {
    if (this.ioSocket) {
        this.ioSocket.emit('virtual-dom-remote-mount:tree',
            semiclone(tree));
    }
};

Page.prototype._sendPatches = function(patches) {
    if (this.ioSocket) {
        this.ioSocket.emit('virtual-dom-remote-mount:patches',
            semiclone(patches));
    }
};

Page.prototype.mountSocketIo = function(socket) {
    if (this.ioSocket) {
        throw 'socket already mounted';
    }
    this.ioSocket = socket;
    socket.on('error', console.error.bind(console));
};

Page.prototype.initialHtml = function() {
    this._tree = this.createTree();
    return vdomToHtml(this._tree);
}

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
};

function clone(src, preprocess) {
    var dst = {};
    copy(dst, src, preprocess);
    return dst;
}

function semiclone(obj) {
    var i, objclone;
    if (obj == null) {
        return obj;
    }
    if (Array.isArray(obj)) {
        objclone = [];
        for (i = 0; i < obj.length; i++) {
            objclone.push(semiclone(obj[i]))
        }
        return objclone;
    }
    if (typeof obj == 'object') {
        objclone = clone(obj, semiclone);
        if (obj.__proto__ != null) {
            objclone.proto = clone(obj.__proto__);
        }
        return objclone;
    }
    return obj;
}
