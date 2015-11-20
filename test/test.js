const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
chai.use(require('sinon-chai'));

const _ = require('lodash');
const React = require('react');
const TestUtils = require('react-addons-test-utils');
const rend = TestUtils.createRenderer();

const Store = require('../src/Store');
const disp = require('../src/dispatcher');
const ViewCtrl = require('../src/ViewCtrl');

const fakeSearchResults = {
    suitepad: require('./search-suitepad'),
    berlin: require('./search-berlin'),
    js: require('./search-javascript'),
    iosSydney: require('./search-ios-sydney')
};

describe('App', function() {
    var store;

    describe('on start', function() {
        beforeEach(function() {
            store = Store(_.values(fakeSearchResults));
        });

        it('should generate Tweets Timeline from different Queries', function() {
            _.each(_.values(fakeSearchResults), function(result) {
                expect(store.getTimeline()).to.contain(result);
            });
        });

        it('should show Twit Timeline', function() {
            const viewCtrl = React.createElement(ViewCtrl, { store: store });
            rend.render(viewCtrl);
            var comp = rend.getRenderOutput();

            const timeline = comp.props.children;
            expect(timeline.props.list).to.equal(store.getTimeline());
        });

        it('should show Queries settings with Text Search input', function() {
            const viewCtrl = React.createElement(ViewCtrl, { store: store });

            expect(viewCtrl).to.exist;
        });
        it('should show Queries settings with Geocode Search input');
        it('should show Queries settings with Language selector');
        it('should load Queries settings from Local storage')
    });

    describe('on Filter change', function() {
        const textFilter = 'iOS';
        const langFilter = 'en';
        const geocodeFilterSydney = [-33.86, 151.211, '1000km'];
        const queryIndex = 2;

        const isSubStr = function(str, substr) {
            return str.toLowerCase().indexOf(substr.toLowerCase()) !== -1;
        };

        var store;

        beforeEach(function() {
            store = Store();
            sinon.stub(store, 'ajax').returns(Promise.resolve(fakeSearchResults['iosSydney']));
        });

        it('should send proper Request for new tweets', function() {
            disp.dispatch({
                type: 'filterChanged',
                text: textFilter,
                geocode: geocodeFilterSydney,
                lang: langFilter,
                index: 0
            });

            const expectedUrl = 'url?q='+textFilter+'&geocode='+geocodeFilterSydney+'&lang='+langFilter;

            expect(store.ajax).to.be.calledWith(expectedUrl);
        });

        it('should get Twits with Searched Text', function(done) {
            expect(store.getTimeline().length).to.equal(0);

            store.addChangeListener(function() {
                expect(store.getTimeline().length).not.to.equal(0);

                _.each(store.getTimeline(), function(tweet) {
                    expect(isSubStr(tweet.text, textFilter)).to.be.true;
                });
                done();
            });

            store.fetch(queryIndex, {});
        });

        it('should show Twits in Selected Language', function() {
            expect(store.getTimeline().length).to.equal(0);

            store.addChangeListener(function() {
                expect(store.getTimeline().length).not.to.equal(0);

                _.each(store.getTimeline(), function(tweet) {
                    expect(tweet.lang).to.equal(langFilter);
                });
                done();
            });

            store.fetch(queryIndex, {});
        });
    });
});