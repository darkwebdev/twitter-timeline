const React = require('react');
const ReactDOM = require('react-dom');

const Store = require('./src/Store');
const ViewCtrl = require('./src/ViewCtrl');

(function(document) {

    const tweets = [
        require('./test/search-suitepad').statuses,
        require('./test/search-javascript').statuses,
        require('./test/search-ios-sydney').statuses
    ];

    ReactDOM.render(
        React.createElement(ViewCtrl, { store: Store(tweets) }),
        document.getElementById('app')
    );

}(window.document));
