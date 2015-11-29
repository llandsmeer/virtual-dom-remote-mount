'use strict';

var h = require('virtual-dom/h');
var Page = require('./page.js');
var mount = require('./mount');

class App extends Page {

    constructor() {
        super();
        this.state = { count: 0 };
        setInterval(this.updateState.bind(this), 30);
    }

    render() {
        return h('h1', 'Count: ' + this.state.count);
    }

    updateState() {
        this.set(function (oldState) {
            return { count: oldState.count + 1 };
        });
    }

}

mount(3000, App);
