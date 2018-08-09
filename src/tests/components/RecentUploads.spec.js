import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';

import RecentUploads from '../../components/RecentUploads';

const localStorageMock = {
    getItem: jest.fn()
    };
global.localStorage = localStorageMock;

it('renders modal', () => {
  expect(renderer.create(<RecentUploads />).toJSON()).toMatchSnapshot()
});