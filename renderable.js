/*jslint node:true*/

'use strict';

var EventEmitter = require('events');
var diff = require('virtual-dom/diff');
var vdomToHtml = require('vdom-to-html');

function Renderable() {
    return;
}

Renderable.prototype.isRenderable = true;

/* public abstract */

Renderable.prototype.render = function () {
    throw 'render() not implemented';
};

/* public */

Renderable.prototype.onpatches = function (cb, thisInstance) {
    this._renderable_eventemitter().on('patches', function (patches) {
        cb.call(thisInstance, patches);
    });
};

Renderable.prototype.renderTree = function () {
    return this.render();
};

Renderable.prototype.renderHtml = function () {
    this._renderable_tree = this.renderTree();
    return vdomToHtml(this._renderable_tree);
};

Renderable.prototype.update = function () {
    this._renderable_sendNextTree(this.renderTree());
};

/* private */

Renderable.prototype._renderable_initialTree = function () {
    this._renderable_tree = this.renderTree();
    return this._renderable_tree;
};

Renderable.prototype._renderable_sendNextTree = function (nextTree) {
    if (this._renderable_tree === undefined) {
        throw 'no tree to diff on. call renderTree() or renderHtml first.';
    }
    this._renderable_sendPatches(diff(this._renderable_tree, nextTree));
    this._renderable_tree = nextTree;
};

Renderable.prototype._renderable_sendPatches = function (patches) {
    this._renderable_eventemitter().emit('patches', patches);
};

Renderable.prototype._renderable_eventemitter = function () {
    if (this._renderable_eventemitter_instance === undefined) {
        this._renderable_eventemitter_instance = new EventEmitter();
    }
    return this._renderable_eventemitter_instance;
};

/* exports */

module.exports = Renderable;
