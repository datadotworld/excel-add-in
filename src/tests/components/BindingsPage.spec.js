/*
 * Copyright 2017 data.world, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * This product includes software developed at
 * data.world, Inc. (http://data.world/).
 */
import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import { IntlProvider } from 'react-intl';

import BindingsPage from '../../components/BindingsPage';

const dataset = {
  owner: 'test',
  id: 'test',
  title: 'This is a test',
  updated: '2017-07-20T14:24:51.762Z',
  created: '2017-07-20T14:24:51.762Z',
  files: [],
  accessLevel: 'ADMIN'
};

it('renders bindings page', () => {
  expect(renderer.create(<BindingsPage dataset={dataset} />).toJSON()).toMatchSnapshot()
});

it('renders bindings page - dataset with files', () => {
  const datasetWithFiles = Object.assign(dataset);
  datasetWithFiles.files = [{
    name: 'test_file.csv',
    updated: '2017-07-20T14:24:51.762Z',
    created: '2017-07-20T14:24:51.762Z'
  }];

  expect(renderer.create(
    <IntlProvider locale='en'>
      <BindingsPage dataset={datasetWithFiles} />
    </IntlProvider>).toJSON()).toMatchSnapshot()
});

it('renders bindings page - dataset with files, bindings', () => {
  const datasetWithFiles = Object.assign(dataset);
  datasetWithFiles.files = [{
    name: 'test_file.csv',
    updated: '2017-07-20T14:24:51.762Z',
    created: '2017-07-20T14:24:51.762Z'
  }];
  const bindings = [{
    id: 'dw::test_file.csv'
  }];
  const syncStatus = {};
  syncStatus['dw::test_file.csv'] = {
    synced: true,
    lastSync: '2017-07-20T14:24:51.762Z',
    changes: 0
  };

  expect(renderer.create(
    <IntlProvider locale='en'>
      <BindingsPage dataset={datasetWithFiles} bindings={bindings} syncStatus={syncStatus} />
    </IntlProvider>).toJSON()).toMatchSnapshot()
});

it('renders bindings page - syncing', () => {
  const datasetWithFiles = Object.assign(dataset);
  datasetWithFiles.files = [{
    name: 'test_file.csv',
    updated: '2017-07-20T14:24:51.762Z',
    created: '2017-07-20T14:24:51.762Z'
  }];
  const bindings = [{
    id: 'dw::test_file.csv'
  }];
  const syncStatus = {};
  syncStatus['dw::test_file.csv'] = {
    synced: false,
    lastSync: '2017-07-20T14:24:51.762Z',
    changes: 3
  };

  expect(renderer.create(
    <IntlProvider locale='en'>
      <BindingsPage dataset={datasetWithFiles} bindings={bindings} syncStatus={syncStatus} syncing />
    </IntlProvider>).toJSON()).toMatchSnapshot()
});

it('renders binding page - insufficient access', () => {
  const datasetWithoutAccess = Object.assign(dataset);
  datasetWithoutAccess.accessLevel = 'READ';

  expect(renderer.create(
    <IntlProvider locale='en'>
      <BindingsPage dataset={datasetWithoutAccess} />
    </IntlProvider>).toJSON()).toMatchSnapshot()
});