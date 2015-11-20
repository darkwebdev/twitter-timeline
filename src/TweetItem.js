var React = require('react');

module.exports = React.createClass({
    render: function() {
        return (
            <article className="tweet">
                <p>{ tweet.text }</p>
            </article>
        );
    }
});
