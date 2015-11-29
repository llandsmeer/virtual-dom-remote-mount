var Renderable = require('./renderable')
var Page = require('./page');
var Mount = require('./mount');

function mount(port, Renderable, cb) {
    var server = new Mount(Renderable);
    server.listen(port, cb);
}

module.exports = mount;
module.exports.Renderable = Renderable;
module.exports.Page = Page;
module.exports.Mount = Mount;
