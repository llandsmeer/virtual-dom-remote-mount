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
        this.ioSocket.emit('virtual-dom-remote-mount:tree', ioClone(tree));
    }
};

Page.prototype._sendPatches = function(patches) {
    if (this.ioSocket) {
        this.ioSocket.emit('virtual-dom-remote-mount:patches', patches);
    }
};

Page.prototype.mountSocketIo = function(socket) {
    if (this.ioSocket) {
        throw 'socket already mounted';
    }
    this.ioSocket = socket;
};

Page.prototype.initialHtml = function() {
    this._tree = this.createTree();
    return vdomToHtml(this._tree);
}

module.exports = Page;

function copy(dst, src) {
    var key;
    for (key in src) {
        if (dst.hasOwnProperty(key)) {
            dst[key] = src[key];
        }
    }
};
