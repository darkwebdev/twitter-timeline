const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
chai.use(require('sinon-chai'));

const _ = require('lodash');
const React = require('react');
const TestUtils = require('react-addons-test-utils');

const Store = require('../src/Store');
const disp = require('../src/dispatcher');
const ViewCtrl = require('../src/ViewCtrl');
const Filters = require('../src/Filters');

const fakeSearchResults = {
    suitepad: require('./search-suitepad'),
    //berlin: require('./search-berlin'),
    js: require('./search-javascript'),
    iosSydney: require('./search-ios-sydney')
};
const defaultFilters = {
    text: 'text',
    geocode: [1, 2, '100km'],
    lang: 'en'
};
const createFakeStorage = function() {
    return {
        getItem: _.constant(JSON.stringify([defaultFilters, {}, {}])),
        setItem: sinon.spy()
    };
};

var store;
var state;
var viewCtrl;
var filters;
var instance;

const filtersPos = 0;
const timelinePos = 1;

const getOutput = function(comp) {
    const rend = TestUtils.createRenderer();
    rend.render(comp);
    return rend.getRenderOutput();
};
const getInstance = function(comp) {
    const rend = TestUtils.createRenderer();
    rend.render(comp);
    return rend._instance._instance;
};

const getSubComp = function(comp, index) {
    const output = getOutput(comp);

    return index === undefined ? output.props.children : output.props.children[index];
};

describe('App', function() {

    describe('on start', function() {
        beforeEach(function() {
            const storeOptions = {
                collection: _.values(fakeSearchResults),
                storage: createFakeStorage()
            };
            store = Store(storeOptions);
            viewCtrl = React.createElement(ViewCtrl, { store: store });
        });
        afterEach(function() {
            store.close();
        });

        it('should generate Tweets Timeline from different Queries', function() {
            _.each(_.values(fakeSearchResults), function(result) {
                expect(store.getState().timeline).to.contain(result);
            });
        });

        it('should show Tweets Timeline', function() {
            const timeline = getSubComp(viewCtrl, timelinePos);

            expect(timeline.props.list).to.deep.equal(store.getState().timeline);
        });

        it('should show Filters with Text Search input', function() {
            const filters = getSubComp(viewCtrl, filtersPos);

            expect(filters[0].props.settings).to.deep.equal(store.getState().filters[0]);
        });

        it('should load Filters settings from Local storage', function() {
            store.updateFilter(0, {});
            expect(store.getState().filters[0]).to.deep.equal({});

            store.loadFilters();
            expect(store.getState().filters[0]).to.deep.equal(defaultFilters);
        });
    });

    describe('on Filter change', function() {
        beforeEach(function() {
            const storeOptions = {
                collection: _.values(fakeSearchResults),
                storage: createFakeStorage()
            };
            store = Store(storeOptions);
            store.ajaxType = 'json';

            viewCtrl = React.createElement(ViewCtrl, { store: store });
        });
        afterEach(function() {
            store.close();
        });
        it('should save Filters settings to Local storage', function() {
            const filters = { text: 'some text' };
            const expectedFilters = JSON.stringify([ filters, {}, {} ]);

            store.updateFilter(0, filters);
            expect(store.getState().filters[0]).to.deep.equal(filters);

            store.saveFilters();
            expect(store.getStorage().setItem).to.be.calledWith('filters', expectedFilters);
        });

        _.range(3).map(function(queryIndex) {
            [
                {
                    name: 'text',
                    handler: 'onTextChange',
                    value: 'changed text'
                },
                {
                    name: 'geocode',
                    handler: 'onGeocodeChange',
                    value: [22.22, 33.33, '1km']
                },
                {
                    name: 'lang',
                    handler: 'onLangChange',
                    value: 'fr'
                }
            ].map(function(filter) {

                it('should call onChange with changed Filter #' + queryIndex
                    + ' [' + filter.name + '] in ViewCtrl', function(done) {

                    const filtersProps = {
                        index: queryIndex,
                        settings: defaultFilters,
                        onChange: sinon.spy()
                    };
                    filters = React.createElement(Filters, filtersProps);
                    instance = getInstance(filters);

                    instance[filter.handler]({ target: { value: filter.value } });
                    var filterChanges = {};
                    filterChanges[filter.name] = filter.value;
                    var expectedFilters = _.extend(defaultFilters, filterChanges);

                    setTimeout(function() {
                        expect(filtersProps.onChange).to.be.calledWith(queryIndex, expectedFilters);
                        done();
                    }, 300);
                });

            });

        });

        it('should send Update action to the Store', function() {
            const filtersComp = getSubComp(viewCtrl, filtersPos);
            const queryIndex = 0;
            const expectedAction = {
                type: 'update',
                filters: defaultFilters,
                index: queryIndex
            };

            sinon.spy(disp, 'dispatch');

            filtersComp[queryIndex].props.onChange(queryIndex, defaultFilters);

            expect(disp.dispatch).to.be.calledWith(expectedAction);
        });
    });

    describe('on Update action', function() {
        const textFilter = 'iOS';
        const langFilter = 'en';
        const geocodeFilterSydney = [-33.86, 151.211, '1000km'];

        beforeEach(function () {
            store = Store({ storage: createFakeStorage() });
            sinon.stub(store, 'ajax').returns(Promise.resolve());
        });
        afterEach(function () {
            store.close();
        });

        it('should send proper Request for new tweets', function () {
            disp.dispatch({
                type: 'update',
                filters: {
                    text: textFilter,
                    geocode: geocodeFilterSydney,
                    lang: langFilter
                },
                index: 0
            });

            const url = 'http://demo.suitepad.systems/1.1/search/tweets.json';
            //const url = './test/tweets.json';
            const expectedOptions = {
                url: url + '?q=' + textFilter + '&geocode=' + geocodeFilterSydney + '&lang=' + langFilter,
                type: 'jsonp'
            };

            expect(store.ajax).to.be.calledWith(expectedOptions);
        });
    });

    describe('on getting tweets from Server', function() {
        const textFilter = 'iOS';
        const langFilter = 'en';
        const queryIndex = 2;

        const isSubStr = function (str, substr) {
            return str.toLowerCase().indexOf(substr.toLowerCase()) !== -1;
        };

        beforeEach(function() {
            store = Store({ storage: createFakeStorage() });
            state = store.getState();
            sinon.stub(store, 'ajax').returns(Promise.resolve(fakeSearchResults['iosSydney']));
        });
        afterEach(function() {
            store.close();
        });

        it('should inject Tweets with Searched Text and Language into Timeline', function(done) {
            expect(state.timeline.length).to.equal(0);

            store.addChangeListener(function() {
                expect(store.getState().timeline.length).not.to.equal(0);

                _.each(store.getState().timeline, function(tweet) {
                    expect(isSubStr(tweet.text, textFilter)).to.be.true;
                    expect(tweet.lang).to.equal(langFilter);
                });
                done();
            });

            store.updateQuery(queryIndex);
        });

        it('should redraw the View with updated Timeline', function(done) {
            viewCtrl = React.createElement(ViewCtrl, { store: store });

            expect(getSubComp(viewCtrl, timelinePos).props.list.length).to.equal(0);

            store.addChangeListener(function() {
                expect(getSubComp(viewCtrl, timelinePos).props.list.length).to.be.gt(0);

                done();
            });

            store.updateQuery(queryIndex);
        });

    });
});