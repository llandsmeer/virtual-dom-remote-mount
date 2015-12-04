'use strict';

var h = require('virtual-dom/h');
var mount = require('./');

class Counter extends mount.Page {

    constructor() {
        super();
        this.state = { count: 0 };
    }

    render() {
        return h('h1', {
            onclick() {
                this.set(function (oldState) {
                    return { count: oldState.count + 1 };
                });
            }
        }, 'Clicked ' + this.state.count + ' times!');
    }

}

mount(3000, Counter);
