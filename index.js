const React = require('react');
const ReactDOM = require('react-dom');

const Store = require('./src/Store');
const ViewCtrl = require('./src/ViewCtrl');

(function(document) {

    const tweets = [
        {
            text: 'tweet text'
        },
        {
            text: 'another tweet'
        },
        {
            text: 'third one'
        }
    ];

    ReactDOM.render(
        React.createElement(ViewCtrl, { store: Store(tweets) }),
        document.getElementById('app')
    );

}(window.document));
