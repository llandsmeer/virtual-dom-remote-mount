# virtual-dom-remote-mount

Write code using virtual-dom without having to worry about the client side.

## Example

```javascript
var h = require('virtual-dom/h');
var Page = require('./page.js');
var mount = require('./virtual-dom-remote-mount.js');

class App extends Page {

    init() {
        this.head = ['<title>hello, world</title>'];
        this.state = { count: 0 };
        setInterval(this.update.bind(this), 30);
    }

    render(state) {
        return h('h1', 'count ' + state.count);
    }

    update() {
        this.setState(function (oldState) {
            return { count: oldState.count + 1 };
        });
    }

}

require('./virtual-dom-remote-mount.js')(3000, App);
```
