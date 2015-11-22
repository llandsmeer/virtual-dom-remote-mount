/*jslint node: true*/

'use strict';

var path = require('path');
var uuid = require('uuid');
var express = require('express');
var socketio = require('socket.io');
var browserify = require('browserify');

var SCRIPT_NAME = 'client.js';
var RECOMPILE_ALWAYS = true;

function Mount(Page, registerExpressCustom) {
    this.register = new Map();
    this.Page = Page;
    this.app = express();
    if (registerExpressCustom) {
        registerExpressCustom(this.app);
    }
}

Mount.prototype.listen = function (port, cb) {
    var server;
    this.registerExpress();
    server = this.app.listen(port || 3000, cb || function () {
        var address = server.address();
        console.log('listening on http://*:' + address.port + '/');
    });
    this.io = socketio.listen(server);
    this.io.on('connection', this.handleSocketConnection.bind(this));
};

Mount.prototype.registerExpress = function () {
    this.app.get('/virtual-dom-remote-mount.js', this.sendJavascript.bind(this));
    this.app.use('/', this.handleHttpConnection.bind(this));
};

Mount.prototype.handleHttpConnection = function (req, res) {
    var connid, page;
    res.set('Content-Type', 'text/html');
    connid = this.generateConnectionId();
    page = new this.Page();
    res.send(pageToHtml(connid, page));
    this.register.set(connid, page);
};

Mount.prototype.handleSocketConnection = function (socket) {
    socket.on('virtual-dom-remote-mount:connect', (function (connid) {
        var page = this.register.get(connid);
        if (page) {
            page.mountSocketIo(socket);
        }
    }).bind(this));
};


Mount.prototype.sendJavascript = function (req, res) {
    res.set('Content-Type', 'text/javascript');
    if (this.cachedScript === undefined || RECOMPILE_ALWAYS) {
        compileJavascript(SCRIPT_NAME, function (script) {
            this.cachedScript = script;
            res.send(script);
        }, this);
    } else {
        res.send(this.cachedScript);
    }
};

Mount.prototype.generateConnectionId = function () {
    return uuid.v4();
};

module.exports = function (port, PageClass, cb) {
    var mount = new Mount(PageClass);
    mount.listen(port, cb);
};

module.exports.Mount = Mount;

function compileJavascript(filename, cb, bindTo) {
    var bundle;
    bundle = browserify(path.join(__dirname, filename)).bundle();
    streamToString(bundle, cb.bind(bindTo));
}

function streamToString(stream, cb) {
    var result = '';
    stream.on('data', function (buffer) {
        result += buffer.toString();
    });
    stream.on('end', function () {
        cb(result);
    });
}

function pageToHtml(connid, page) {
    return (
        '<!doctype html>' +
        '<html>' +
            '<head>' +
                '<script src="/socket.io/socket.io.js"' +
                       ' type="text/javascript"></script>' +
                (page.head || []).join('') +
                '<script type="text/javascript">' +
                    'var VIRTUALDOMREMOTEMOUNTID = ' +
                        JSON.stringify(connid) +
                        ';' +
                '</script>' +
            '</head>' +
            '<body>' +
                '<script src="virtual-dom-remote-mount.js"' +
                       ' type="text/javascript"></script>' +
                '<div id="virtual-dom-remote-mount-target">' +
                    page.initialHtml() +
                '</div>' +
            '</body>' +
        '</html>'
    );
}
