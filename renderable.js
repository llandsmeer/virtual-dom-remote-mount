/*jslint node:true*/

'use strict';

var EventEmitter = require('events');
var diff = require('virtual-dom/diff');
var vdomToHtml = require('vdom-to-html');
var helpers = require('./helpers.js');

function Renderable() {
    return;
}

Renderable.prototype.isRenderable = true;

/* public abstract */

Renderable.prototype.render = function () {
    throw 'render() not implemented';
};

/* public */

Renderable.prototype.onupdate = function (cb, thisInstance) {
    this._renderable_eventemitter().on('update', function (update) {
        cb.call(thisInstance, update);
    });
};

Renderable.prototype.renderTree = function () {
    var tree;
    tree = this.render();
    this._renderable_updateEvents(tree);
    return tree;
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
    var eventSubscribeQueue, eventUnsubscribeQueue;
    eventSubscribeQueue = this._renderable_eventSubscribeQueue();
    eventUnsubscribeQueue = this._renderable_eventUnsubscribeQueue();
    this._renderable_eventemitter().emit('update', {
        patches: patches,
        events: {
            subscribe: eventSubscribeQueue,
            unsubscribe: eventUnsubscribeQueue
        }
    });
    eventSubscribeQueue.length = 0;
    eventUnsubscribeQueue.length = 0;
};

Renderable.prototype._renderable_eventemitter = function () {
    if (this._renderable_eventemitter_instance === undefined) {
        this._renderable_eventemitter_instance = new EventEmitter();
    }
    return this._renderable_eventemitter_instance;
};

/* events */

Renderable.prototype._renderable_updateEvents = function (tree) {
    var handlers, prevHandlers, allEventNames, prevAllEventNames, allEventDiff,
        eventSubscribeQueue, eventUnsubscribeQueue;
    handlers = new Map();
    allEventNames = new Set();
    helpers.vdom.popEvents(tree, function (path, eventName, handler) {
        var eventPath;
        eventPath = path.join('.') + ':' + eventName;
        handlers.set(eventPath, handler);
        allEventNames.add(eventName);
    });
    this._renderable_handlers = handlers;
    prevAllEventNames = this._renderable_allEventNames;
    allEventDiff = helpers.difference(allEventNames, prevAllEventNames);
    eventSubscribeQueue = this._renderable_eventSubscribeQueue();
    eventUnsubscribeQueue = this._renderable_eventUnsubscribeQueue();
    allEventDiff.created.forEach(function (createdEvent) {
        eventSubscribeQueue.push(createdEvent);
    });
    allEventDiff.deleted.forEach(function (deletedEvent) {
        eventUnsubscribeQueue.push(deletedEvent);
    });
    this._renderable_allEventNames = allEventNames;
};

Renderable.prototype._renderable_eventSubscribeQueue = function () {
    if (this._renderable_eventSubscribeQueueInstance === undefined) {
        this._renderable_eventSubscribeQueueInstance = [];
    }
    return this._renderable_eventSubscribeQueueInstance;
};

Renderable.prototype._renderable_eventUnsubscribeQueue = function () {
    if (this._renderable_eventUnsubscribeQueueInstance === undefined) {
        this._renderable_eventUnsubscribeQueueInstance = [];
    }
    return this._renderable_eventUnsubscribeQueueInstance;
};

Renderable.prototype.handleEvent = function (eventPath, args) {
    var handler;
    if (!this._renderable_handlers) {
        return;
    }
    console.log(this._renderable_handlers.keys());
    handler = this._renderable_handlers.get(eventPath);
    if (!handler) {
        return;
    }
    handler.call(this, args);
};

/* exports */

module.exports = Renderable;
