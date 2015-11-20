var diff = require('virtual-dom/diff');

function Page() {
    this.state = {};
    this.init();
    this.tree = null;
}

Page.prototype.render = function(state) {
};

Page.prototype.init = function(state) {
};

Page.prototype.setState = function(nextState) {
    var key;
    if (typeof nextState === 'function') {
        nextState = nextState(this.state);
    }
    if (typeof nextState !== 'object') {
        throw 'nextState is not or does not return an object';
    }
    for (key in nextState) {
        if (nextState.hasOwnProperty(key)) {
            this.state[key] = nextState[key];
        }
    }
    this.forceUpdate();
};

Page.prototype.replaceState = function(nextState) {
    this.state = {};
    this.setState(nextState);
};

Page.prototype.forceUpdate = function() {
};

module.exports = Page;
