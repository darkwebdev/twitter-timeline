var React = require('react');

module.exports = React.createClass({
    render: function() {
        return (
            <article className="tweet">
                <time>{ this.props.data.created_at }</time>
                <p>{ this.props.data.text }</p>
            </article>
        );
    }
});
