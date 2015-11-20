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
    this.state = nextState;
    this.forceUpdate();
};

Page.prototype.replaceState = function(nextState) {
    this.state = {};
    this.setState(nextState);
};

Page.prototype.forceUpdate = function() {
};

module.exports = Page;
