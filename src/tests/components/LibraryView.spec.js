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

import LibraryView from '../../components/LibraryView';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(
    <LibraryView
      getItems={() =>
        new Promise((resolve) => {
          resolve([]);
        })
      }
    />,
    div
  );
});

it('renders datasets view - loading state', () => {
  expect(
    renderer
      .create(
        <LibraryView
          loadingLibraries
          getItems={() =>
            new Promise((resolve) => {
              resolve([]);
            })
          }
        />
      )
      .toJSON()
  ).toMatchSnapshot();
});

it('renders datasets view - no datasets', () => {
  expect(
    renderer
      .create(
        <LibraryView
          loading={false}
          getItems={() =>
            new Promise((resolve) => {
              resolve([]);
            })
          }
        />
      )
      .toJSON()
  ).toMatchSnapshot();
});

it('renders datasets view - datasets', () => {
  expect(
    renderer
      .create(
        <IntlProvider locale="en">
          <LibraryView
            loading={false}
            getItems={() =>
              new Promise((resolve) => {
                resolve([]);
              })
            }
          />
        </IntlProvider>
      )
      .toJSON()
  ).toMatchSnapshot();
});
