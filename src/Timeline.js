var React = require('react');
var Tweet = require('./Tweet');

module.exports = React.createClass({
    render: function() {
        return (
            <div className="timeline">
                {
                    this.props.list.map(function(tweet) {
                        return (
                            <Tweet data={ tweet } />
                        );
                    })
                }
            </div>
        );
    }
});
