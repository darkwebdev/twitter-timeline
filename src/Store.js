const _ = require('lodash');
const req = require('reqwest');
const EventEmitter = require('events').EventEmitter;
const disp = require('./dispatcher');

const buildUrl = function(filter) {
    const url= 'http://demo.suitepad.systems/1.1/search/tweets.json';
    //const url= './test/tweets.json';
    const filterStr = (filter.text ? 'q=' + filter.text : '') +
        (filter.geocode ? '&geocode=' + filter.geocode : '') +
        (filter.lang ? '&lang=' + filter.lang : '');

    return url + (filterStr ? '?' + filterStr : '');
};

const buildTimeline = function(q) {
    return _.compact(_.flatten(q));
};

var Store = function(queriesData) {
    var queries = queriesData || [];
    var filters = [ {
        text: 'ios',
        geocode: [-33.86, 151.211, '1000km'],
        lang: 'en'
    }, {}, {} ];

    var store = _.extend({}, EventEmitter.prototype, {
        emitChange: function () {
            console.log('emit change');
            this.emit('change');
        },

        addChangeListener: function (callback) {
            this.on('change', callback);
        },
        removeChangeListener: function (callback) {
            this.removeListener('change', callback);
        },

        ajax: req,
        fetch: function (index, filter) {
            const ajaxOptions = {
                url: buildUrl(filter),
                type: 'jsonp'
            };

            store.ajax(ajaxOptions).then(function (data) {
                queries[index] = data.statuses;
                console.log('fetch queries', queries.length, filters[index]);
                store.emitChange();
            });

            return this;
        },

        getState: function () {
            return {
                timeline: buildTimeline(queries),
                filters: filters
            };
        },

        close: function() {
            disp.unregister(dispToken);
        }
    });

    if (queries.length) store.emitChange();

    var dispToken = disp.register(function (action) {
        switch (action.type) {
            case 'update':
                console.log('dispatcher update', queries.length);
                if (action.filters) {
                    filters[action.index] = action.filters;
                }
                store.fetch(action.index, filters[action.index]);
                break;
        }
    });

    return store;
};

module.exports = Store;