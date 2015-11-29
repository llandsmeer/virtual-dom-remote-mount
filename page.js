/*jslint node:true*/

'use strict';

var diff = require('virtual-dom/diff');
var vdomToHtml = require('vdom-to-html');
var Renderable = require('./renderable');
var helpers = require('./helpers');

function Page() {
    this.state = {};
}

Page.prototype = Object.create(Renderable.prototype);

Page.prototype.set = function (nextState) {
    if (typeof nextState === 'function') {
        nextState = nextState(this.state);
    }
    if (typeof nextState !== 'object') {
        throw 'nextState is not or does not return an object';
    }
    helpers.copy(this.state, nextState);
    this.update();
};

Page.prototype.replace = function (nextState) {
    this.state = {};
    this.set(nextState);
};

module.exports = Page;
