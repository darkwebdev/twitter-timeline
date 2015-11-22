const React = require('react');
const ReactDOM = require('react-dom');

const Store = require('./src/Store');
const ViewCtrl = require('./src/ViewCtrl');

(function(document) {

    ReactDOM.render(
        React.createElement(ViewCtrl, { store: Store() }),
        document.getElementById('app')
    );

}(window.document));
