var React = require('react');

module.exports = React.createClass({
    render: function() {
        return (
            <div className="timeline">
                {
                    this.props.list.map(function(tweet) {
                        return (
                            <TweetItem data={ tweet } />
                        );
                    })
                }
            </div>
        );
    }
});
