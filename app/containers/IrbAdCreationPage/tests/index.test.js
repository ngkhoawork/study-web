// import IrbAdCreationPage from '../index';

import expect from 'expect';
import { shallow, mount } from 'enzyme';

import { Provider } from 'react-redux';
import React from 'react';
import configureStore from '../../../store';
import IrbAdCreationPage from '../index';

describe('<IrbAdCreationPage />', () => {
  let setup;

  beforeEach(() => {
    setup = () => {
      const props = {
        siteLocations: [],
        indications: [],
        fetchSites: expect.createSpy(),
        fetchIndications: expect.createSpy(),
        submitForm: expect.createSpy(),
      };

      const shallowWrapper = shallow(<IrbAdCreationPage {...props} />);

      return {
        props,
        shallowWrapper,
      };
    };
  });

  it('should call fetchSites and fetchIndications on load', () => {
    const { props } = setup();
    const mountWrapper = mount( // eslint-disable-line
      <Provider store={configureStore({})}>
        <IrbAdCreationPage {...props} />
      </Provider>
    );

    expect(props.fetchSites).toHaveBeenCalled();
    expect(props.fetchIndications).toHaveBeenCalled();
  });
});
