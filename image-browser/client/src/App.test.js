import React from 'react';
import { mount } from 'enzyme';

import App from './App';

describe('App', () => {
  const { fetch } = global;
  let fetchPromises = [];

  beforeEach(() => {
    fetchPromises = [];

    global.fetch = jest.fn().mockImplementation(endpoint => {
      const fetchPromise = new Promise(resolve => {
        resolve({
          json: () => {
            switch (true) {
              case endpoint === '/api/imageAttributes':
                return ['languageCode', 'movieId'];
              case endpoint === '/api/imageAttributes/languageCode':
                return ['de', 'fr-CA'];
              case endpoint === '/api/imageAttributes/movieId':
                return [70242311, 70178217, 70305883, 12345678];
              case /^\/api\/images/.test(endpoint):
                return {
                  images: [
                    {
                      movieId: 70242311,
                      movieName: 'Orange Is the New Black',
                      imageType: 'sdp',
                      thumbnailUrl: `${endpoint}---oitnb-thumbnail.jpg`,
                      fullSizeImageUrl: `${endpoint}---oitnb-fullsize.jpg`,
                      languageCode: 'it',
                    },
                    {
                      movieId: 70178217,
                      movieName: 'House of Cards',
                      imageType: 'sdp',
                      thumbnailUrl: `${endpoint}---hoc-thumbnail.jpg`,
                      fullSizeImageUrl: `${endpoint}---hoc-fullsize.jpg`,
                      languageCode: 'de',
                    },
                    {
                      movieId: 70305883,
                      movieName: 'Marco Polo',
                      imageType: 'sdp',
                      thumbnailUrl: `${endpoint}---mp-thumbnail.jpg`,
                      fullSizeImageUrl: `${endpoint}---mp-fullsize.jpg`,
                      languageCode: 'fr-CA',
                    },
                  ],
                  totalCount: 6,
                };
              default:
                throw `Unexpected endpoint [${endpoint}]`;
            }
          },
        });
      });

      fetchPromises.push(fetchPromise);

      return fetchPromise;
    });
  });

  afterEach(() => {
    global.fetch = fetch;
  });

  // TODO: Testing using jsdom breaks `getBoundingClientRect`
  // (see https://github.com/jsdom/jsdom/issues/1590),
  // so we can't test infinite scrolling behavior unless we mock `getBoundingClientRect`.

  describe('initial state', () => {
    it('renders the correct components', () => {
      const app = mount(<App />);

      return Promise.all(fetchPromises)
        // Image fetches after the initial image fetch get added to the
        // `fetchPromises` array after the initial batch of promises,
        // so we need to wait for them to resolve too.
        .then(() => Promise.all(fetchPromises))
        .then(() => {
          app.update();

          const nav = app.find('Nav');
          expect(nav).toHaveLength(1);
          expect(nav.find('.Nav-header').text()).toMatch('Group By');
          expect(nav.find('NavButton').map(navButton => navButton.text())).toEqual([
            'languageCode',
            'movieId'
          ]);

          const imageGroup = app.find('ImageGroup');
          expect(imageGroup).toHaveLength(1);
          expect(imageGroup.find('.ImageGroup-title')).toHaveLength(0);
          expect(imageGroup.find('.ImageGroup-subtitle').text()).toMatch('6 Total');
          expect(imageGroup.find('Image').map(image => image.props().image.thumbnailUrl)).toEqual([
            `/api/images?attribute=&attributeValue=&limit=3&offset=0---oitnb-thumbnail.jpg`,
            `/api/images?attribute=&attributeValue=&limit=3&offset=0---hoc-thumbnail.jpg`,
            `/api/images?attribute=&attributeValue=&limit=3&offset=0---mp-thumbnail.jpg`,
            `/api/images?attribute=&attributeValue=&limit=3&offset=3---oitnb-thumbnail.jpg`,
            `/api/images?attribute=&attributeValue=&limit=3&offset=3---hoc-thumbnail.jpg`,
            `/api/images?attribute=&attributeValue=&limit=3&offset=3---mp-thumbnail.jpg`,
          ]);
        });
    });
  });

  describe('navigation', () => {
    it('allows for browsing image groups', () => {
      const app = mount(<App />);

      return Promise.all(fetchPromises)
        .then(() => Promise.all(fetchPromises))
        .then(() => {
          app.update();

          const navAttributesSection = app.find('Nav').find('.Nav-attributes');
          expect(navAttributesSection).toHaveLength(1);
          expect(navAttributesSection.find('.Nav-header').text()).toMatch('Group By');

          const navButtons = navAttributesSection.find('NavButton');
          expect(
            navButtons.map(navButton => navButton.text())
          ).toEqual(['languageCode', 'movieId']);
          navButtons.forEach(navButton => {
            expect(navButton.find('button').hasClass('NavButton-selected')).toBe(false);
          });

          navAttributesSection.find('NavButton').first().simulate('click');

          return Promise.all(fetchPromises);
        })
        .then(() => Promise.all(fetchPromises))
        .then(() => {
          app.update();

          const nav = app.find('Nav');
          const navAttributeButtons = nav.find('.Nav-attributes').find('NavButton');
          const languageCodeButton = navAttributeButtons.first().find('button');
          expect(languageCodeButton.text()).toMatch('languageCode');
          expect(languageCodeButton.hasClass('NavButton-selected')).toBe(true);
          expect(
            navAttributeButtons.last().find('button').hasClass('NavButton-selected')
          ).toBe(false);

          const navAttributeValuesSection = nav.find('.Nav-attribute-values');
          expect(navAttributeValuesSection).toHaveLength(1);
          expect(navAttributeValuesSection.find('.Nav-header').text()).toMatch('languageCode');

          const navAttributeValueButtons = navAttributeValuesSection.find('NavButton');
          expect(
            navAttributeValueButtons.map(navAttributeValueButton => navAttributeValueButton.text())
          ).toEqual(['de', 'fr-CA']);
          navAttributeValueButtons.forEach(navAttributeValueButton => {
            expect(
              navAttributeValueButton.find('button').hasClass('NavButton-selected')
            ).toBe(false);
          });

          const imageGroups = app.find('ImageGroup');
          expect(imageGroups).toHaveLength(2);

          const deImageGroup = imageGroups.first();
          expect(deImageGroup.find('.ImageGroup-title').text()).toMatch('de');
          expect(deImageGroup.find('.ImageGroup-subtitle').text()).toMatch('6 Total');
          expect(
            deImageGroup.find('Image').map(deImage => deImage.props().image.thumbnailUrl)
          ).toEqual([
            `/api/images?attribute=languageCode&attributeValue=de&limit=3&offset=0---oitnb-thumbnail.jpg`,
            `/api/images?attribute=languageCode&attributeValue=de&limit=3&offset=0---hoc-thumbnail.jpg`,
            `/api/images?attribute=languageCode&attributeValue=de&limit=3&offset=0---mp-thumbnail.jpg`,
            `/api/images?attribute=languageCode&attributeValue=de&limit=3&offset=3---oitnb-thumbnail.jpg`,
            `/api/images?attribute=languageCode&attributeValue=de&limit=3&offset=3---hoc-thumbnail.jpg`,
            `/api/images?attribute=languageCode&attributeValue=de&limit=3&offset=3---mp-thumbnail.jpg`,
          ]);

          const frCaImageGroup = imageGroups.last();
          expect(frCaImageGroup.find('.ImageGroup-title').text()).toMatch('fr-CA');
          expect(frCaImageGroup.find('.ImageGroup-subtitle').text()).toMatch('6 Total');
          expect(
            frCaImageGroup.find('Image').map(frCaImage => frCaImage.props().image.thumbnailUrl)
          ).toEqual([
            `/api/images?attribute=languageCode&attributeValue=fr-CA&limit=3&offset=0---oitnb-thumbnail.jpg`,
            `/api/images?attribute=languageCode&attributeValue=fr-CA&limit=3&offset=0---hoc-thumbnail.jpg`,
            `/api/images?attribute=languageCode&attributeValue=fr-CA&limit=3&offset=0---mp-thumbnail.jpg`,
            `/api/images?attribute=languageCode&attributeValue=fr-CA&limit=3&offset=3---oitnb-thumbnail.jpg`,
            `/api/images?attribute=languageCode&attributeValue=fr-CA&limit=3&offset=3---hoc-thumbnail.jpg`,
            `/api/images?attribute=languageCode&attributeValue=fr-CA&limit=3&offset=3---mp-thumbnail.jpg`,
          ]);

          navAttributeValueButtons.last().simulate('click');

          return Promise.all(fetchPromises);
        })
        .then(() => Promise.all(fetchPromises))
        .then(() => {
          app.update();

          const navAttributeValueButtons = app.find('Nav').find('.Nav-attribute-values').find('NavButton');
          const frCaNavButton = navAttributeValueButtons.last();
          expect(frCaNavButton.text()).toMatch('fr-CA');
          expect(frCaNavButton.find('button').hasClass('NavButton-selected')).toBe(true);

          const deNavButton = navAttributeValueButtons.first();
          expect(deNavButton.find('button').hasClass('NavButton-selected')).toBe(false);

          const imageGroups = app.find('ImageGroup');
          expect(imageGroups).toHaveLength(1);

          const imageGroup = imageGroups.first();
          expect(imageGroup.find('.ImageGroup-title').text()).toMatch('fr-CA');
          expect(imageGroup.find('.ImageGroup-subtitle').text()).toMatch('6 Total');
          expect(imageGroup.find('Image').map(image => image.props().image.thumbnailUrl)).toEqual([
            `/api/images?attribute=languageCode&attributeValue=fr-CA&limit=3&offset=0---oitnb-thumbnail.jpg`,
            `/api/images?attribute=languageCode&attributeValue=fr-CA&limit=3&offset=0---hoc-thumbnail.jpg`,
            `/api/images?attribute=languageCode&attributeValue=fr-CA&limit=3&offset=0---mp-thumbnail.jpg`,
            `/api/images?attribute=languageCode&attributeValue=fr-CA&limit=3&offset=3---oitnb-thumbnail.jpg`,
            `/api/images?attribute=languageCode&attributeValue=fr-CA&limit=3&offset=3---hoc-thumbnail.jpg`,
            `/api/images?attribute=languageCode&attributeValue=fr-CA&limit=3&offset=3---mp-thumbnail.jpg`,
          ]);

          deNavButton.simulate('click');

          return Promise.all(fetchPromises);
        })
        .then(() => Promise.all(fetchPromises))
        .then(() => {
          app.update();

          const nav = app.find('Nav');
          const navAttributeValueButtons = nav.find('.Nav-attribute-values').find('NavButton');
          const deNavButton = navAttributeValueButtons.first();
          expect(deNavButton.text()).toMatch('de');
          expect(deNavButton.find('button').hasClass('NavButton-selected')).toBe(true);
          expect(
            navAttributeValueButtons.last().find('button').hasClass('NavButton-selected')
          ).toBe(false);

          const imageGroups = app.find('ImageGroup');
          expect(imageGroups).toHaveLength(1);

          const imageGroup = imageGroups.first();
          expect(imageGroup.find('.ImageGroup-title').text()).toMatch('de');
          expect(imageGroup.find('.ImageGroup-subtitle').text()).toMatch('6 Total');
          expect(imageGroup.find('Image').map(image => image.props().image.thumbnailUrl)).toEqual([
            `/api/images?attribute=languageCode&attributeValue=de&limit=3&offset=0---oitnb-thumbnail.jpg`,
            `/api/images?attribute=languageCode&attributeValue=de&limit=3&offset=0---hoc-thumbnail.jpg`,
            `/api/images?attribute=languageCode&attributeValue=de&limit=3&offset=0---mp-thumbnail.jpg`,
            `/api/images?attribute=languageCode&attributeValue=de&limit=3&offset=3---oitnb-thumbnail.jpg`,
            `/api/images?attribute=languageCode&attributeValue=de&limit=3&offset=3---hoc-thumbnail.jpg`,
            `/api/images?attribute=languageCode&attributeValue=de&limit=3&offset=3---mp-thumbnail.jpg`,
          ]);

          nav.find('.Nav-attributes').find('NavButton').last().simulate('click');

          return Promise.all(fetchPromises);
        })
        .then(() => Promise.all(fetchPromises))
        .then(() => {
          app.update();

          const nav = app.find('Nav');
          const navAttributeButtons = nav.find('.Nav-attributes').find('NavButton');
          const movieIdButton = navAttributeButtons.last().find('button');
          expect(movieIdButton.text()).toMatch('movieId');
          expect(movieIdButton.hasClass('NavButton-selected')).toBe(true);
          expect(
            navAttributeButtons.first().find('button').hasClass('NavButton-selected')
          ).toBe(false);

          const navAttributeValuesSection = nav.find('.Nav-attribute-values');
          expect(navAttributeValuesSection.find('.Nav-header').text()).toMatch('movieId');

          const navAttributeValueButtons = navAttributeValuesSection.find('NavButton');
          expect(
            navAttributeValueButtons.map(navAttributeValueButton => navAttributeValueButton.text())
          ).toEqual(['70242311', '70178217', '70305883', '12345678']);
          navAttributeValueButtons.forEach(navAttributeValueButton => {
            expect(
              navAttributeValueButton.find('button').hasClass('NavButton-selected')
            ).toBe(false);
          });

          const imageGroups = app.find('ImageGroup');
          expect(imageGroups).toHaveLength(4);

          const imageGroup1 = imageGroups.first();
          expect(imageGroup1.find('.ImageGroup-title').text()).toMatch('70242311');
          expect(imageGroup1.find('.ImageGroup-subtitle').text()).toMatch('6 Total');
          expect(
            imageGroup1.find('Image').map(image => image.props().image.thumbnailUrl)
          ).toEqual([
            `/api/images?attribute=movieId&attributeValue=70242311&limit=3&offset=0---oitnb-thumbnail.jpg`,
            `/api/images?attribute=movieId&attributeValue=70242311&limit=3&offset=0---hoc-thumbnail.jpg`,
            `/api/images?attribute=movieId&attributeValue=70242311&limit=3&offset=0---mp-thumbnail.jpg`,
            `/api/images?attribute=movieId&attributeValue=70242311&limit=3&offset=3---oitnb-thumbnail.jpg`,
            `/api/images?attribute=movieId&attributeValue=70242311&limit=3&offset=3---hoc-thumbnail.jpg`,
            `/api/images?attribute=movieId&attributeValue=70242311&limit=3&offset=3---mp-thumbnail.jpg`,
          ]);

          const imageGroup2 = imageGroups.at(1);
          expect(imageGroup2.find('.ImageGroup-title').text()).toMatch('70178217');
          expect(imageGroup2.find('.ImageGroup-subtitle').text()).toMatch('6 Total');
          expect(
            imageGroup2.find('Image').map(image => image.props().image.thumbnailUrl)
          ).toEqual([
            `/api/images?attribute=movieId&attributeValue=70178217&limit=3&offset=0---oitnb-thumbnail.jpg`,
            `/api/images?attribute=movieId&attributeValue=70178217&limit=3&offset=0---hoc-thumbnail.jpg`,
            `/api/images?attribute=movieId&attributeValue=70178217&limit=3&offset=0---mp-thumbnail.jpg`,
            `/api/images?attribute=movieId&attributeValue=70178217&limit=3&offset=3---oitnb-thumbnail.jpg`,
            `/api/images?attribute=movieId&attributeValue=70178217&limit=3&offset=3---hoc-thumbnail.jpg`,
            `/api/images?attribute=movieId&attributeValue=70178217&limit=3&offset=3---mp-thumbnail.jpg`,
          ]);

          const imageGroup3 = imageGroups.at(2);
          expect(imageGroup3.find('.ImageGroup-title').text()).toMatch('70305883');
          expect(imageGroup3.find('.ImageGroup-subtitle').text()).toMatch('6 Total');
          expect(
            imageGroup3.find('Image').map(image => image.props().image.thumbnailUrl)
          ).toEqual([
            `/api/images?attribute=movieId&attributeValue=70305883&limit=3&offset=0---oitnb-thumbnail.jpg`,
            `/api/images?attribute=movieId&attributeValue=70305883&limit=3&offset=0---hoc-thumbnail.jpg`,
            `/api/images?attribute=movieId&attributeValue=70305883&limit=3&offset=0---mp-thumbnail.jpg`,
            `/api/images?attribute=movieId&attributeValue=70305883&limit=3&offset=3---oitnb-thumbnail.jpg`,
            `/api/images?attribute=movieId&attributeValue=70305883&limit=3&offset=3---hoc-thumbnail.jpg`,
            `/api/images?attribute=movieId&attributeValue=70305883&limit=3&offset=3---mp-thumbnail.jpg`,
          ]);

          const imageGroup4 = imageGroups.last();
          expect(imageGroup4.find('.ImageGroup-title').text()).toMatch('12345678');
          expect(imageGroup4.find('.ImageGroup-subtitle').text()).toMatch('6 Total');
          expect(
            imageGroup4.find('Image').map(image => image.props().image.thumbnailUrl)
          ).toEqual([
            `/api/images?attribute=movieId&attributeValue=12345678&limit=3&offset=0---oitnb-thumbnail.jpg`,
            `/api/images?attribute=movieId&attributeValue=12345678&limit=3&offset=0---hoc-thumbnail.jpg`,
            `/api/images?attribute=movieId&attributeValue=12345678&limit=3&offset=0---mp-thumbnail.jpg`,
            `/api/images?attribute=movieId&attributeValue=12345678&limit=3&offset=3---oitnb-thumbnail.jpg`,
            `/api/images?attribute=movieId&attributeValue=12345678&limit=3&offset=3---hoc-thumbnail.jpg`,
            `/api/images?attribute=movieId&attributeValue=12345678&limit=3&offset=3---mp-thumbnail.jpg`,
          ]);
        });
    });
  });

  describe('modal', () => {
    it('allows for opening images in a modal', () => {
      const app = mount(<App />);

      return Promise.all(fetchPromises)
        .then(() => Promise.all(fetchPromises))
        .then(() => {
          app.update();

          expect(app.find('ImageModal')).toHaveLength(0);

          let image = app.find('ImageGroup').find('Image').at(1);
          image.simulate('click');

          let imageModal = app.find('ImageModal');
          const imageProp = image.props().image;
          expect(imageModal).toHaveLength(1);
          expect(imageModal.find('img').props().src).toMatch(imageProp.fullSizeImageUrl);
          expect(imageModal.find('dl')).toHaveLength(1);
          expect(imageModal.find('dt').map(dt => dt.text())).toEqual([
            'movieName',
            'movieId',
            'languageCode',
            'imageType',
            'fullSizeImageUrl',
            'thumbnailUrl',
          ]);
          expect(imageModal.find('dd').map(dd => dd.text())).toEqual([
            imageProp.movieName,
            imageProp.movieId.toString(),
            imageProp.languageCode,
            imageProp.imageType,
            imageProp.fullSizeImageUrl,
            imageProp.thumbnailUrl,
          ]);

          imageModal.find('.ImageModal-close-link').simulate('click');

          expect(app.find('ImageModal')).toHaveLength(0);

          image = app.find('ImageGroup').find('Image').at(4);
          image.simulate('click');

          imageModal = app.find('ImageModal');
          expect(imageModal).toHaveLength(1);
          expect(imageModal.find('img').props().src).toMatch(image.props().image.fullSizeImageUrl);
        });
    });
  });
});
