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

import LibraryItem from '../../components/LibraryItem';

const dataset = {
  owner: 'test',
  id: 'test',
  title: 'This is a test',
  updated: '2017-07-20T14:24:51.762Z',
  created: '2017-07-20T14:24:51.762Z'
};

it('renders dataset', () => {
  expect(
    renderer
      .create(
        <IntlProvider locale="en">
          <LibraryItem dataset={dataset} />
        </IntlProvider>
      )
      .toJSON()
  ).toMatchSnapshot();
});

it('renders dataset - button text', () => {
  expect(
    renderer
      .create(
        <IntlProvider locale="en">
          <LibraryItem dataset={dataset} buttonText="test" />
        </IntlProvider>
      )
      .toJSON()
  ).toMatchSnapshot();
});

it('renders dataset - button text, link', () => {
  expect(
    renderer
      .create(
        <IntlProvider locale="en">
          <LibraryItem
            dataset={dataset}
            buttonText="test"
            buttonLink="https://data.world"
          />
        </IntlProvider>
      )
      .toJSON()
  ).toMatchSnapshot();
});

it('renders dataset - as project', () => {
  const project = Object.assign(dataset);
  project.isProject = true;

  expect(
    renderer
      .create(
        <IntlProvider locale="en">
          <LibraryItem dataset={project} />
        </IntlProvider>
      )
      .toJSON()
  ).toMatchSnapshot();
});
