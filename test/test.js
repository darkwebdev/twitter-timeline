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

const fakeSearchResults = {
    suitepad: require('./search-suitepad'),
    //berlin: require('./search-berlin'),
    js: require('./search-javascript'),
    iosSydney: require('./search-ios-sydney')
};

var store;
var state;
var viewCtrl;
const filtersPos = 0;
const timelinePos = 1;

const getSubComp = function(comp, index) {
    const rend = TestUtils.createRenderer();
    rend.render(comp);
    comp = rend.getRenderOutput();

    return index === undefined ? comp.props.children : comp.props.children[index];
};

describe('App', function() {

    describe('on start', function() {
        beforeEach(function() {
            store = Store(_.values(fakeSearchResults));
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

        it('should show Twit Timeline', function() {
            const timeline = getSubComp(viewCtrl, timelinePos);

            expect(timeline.props.list).to.deep.equal(store.getState().timeline);
        });

        it('should show Filters with Text Search input', function() {
            const filters = getSubComp(viewCtrl, filtersPos);

            expect(filters.props.settings).to.deep.equal(store.getState().filters);
        });
        it('should show Filters with Geocode Search input');
        it('should show Filters with Language selector');
        it('should load Filters settings from Local storage')
    });

    describe('on Filter change', function() {
        it('should send Update action to the Store', function() {

        });
    });

    describe('on Update action', function() {
        const textFilter = 'iOS';
        const langFilter = 'en';
        const geocodeFilterSydney = [-33.86, 151.211, '1000km'];

        beforeEach(function () {
            store = Store();
            sinon.stub(store, 'ajax').returns(Promise.resolve());
        });
        afterEach(function () {
            store.close();
        });

        it('should send proper Request for new tweets', function () {
            disp.dispatch({
                type: 'update',
                filter: {
                    text: textFilter,
                    geocode: geocodeFilterSydney,
                    lang: langFilter
                },
                index: 0
            });

            //const url = 'http://demo.suitepad.systems/1.1/search/tweets.json';
            const url = './test/tweets.json';
            const expectedOptions = {
                url: url + '?q=' + textFilter + '&geocode=' + geocodeFilterSydney + '&lang=' + langFilter,
                withCredentials: true
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
            store = Store();
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

            store.fetch(queryIndex, {});
        });

        it('should redraw the View with updated Timeline', function(done) {
            viewCtrl = React.createElement(ViewCtrl, { store: store });

            expect(getSubComp(viewCtrl, timelinePos).props.list.length).to.equal(0);

            store.addChangeListener(function() {
                expect(getSubComp(viewCtrl, timelinePos).props.list.length).to.be.gt(0);

                done();
            });

            store.fetch(queryIndex, {});
        });

    });
});