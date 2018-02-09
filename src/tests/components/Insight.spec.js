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

import Insights from '../../components/Insights';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<Insights charts={[]} projects={[]}/>, div);
});

it('renders charts view - no charts', () => {
  expect(renderer.create(<Insights charts={[]} projects={['project 1', 'project 2']} />).toJSON()).toMatchSnapshot()
});

it('renders charts view - chart', () => {
  const charts = [
    { sheet: '{00000000-0001-0000-0000-000000000000}', chartName: 'Chart 1' },
    { sheet: '{00000000-0001-0000-0000-000000000000}', chartName: 'Chart 2' }
  ];

  const getImage = () => {
    return new Promise((resolve, reject) => {
      resolve('b64string');
    })
  }

  expect(renderer.create(
    <IntlProvider locale='en'>
      <Insights charts={charts} getImage={getImage} projects={[]} />
    </IntlProvider>).toJSON()).toMatchSnapshot()
});

it('renders no projects view', () => {
  expect(renderer.create(<Insights charts={[]} projects={[]} />).toJSON()).toMatchSnapshot()
});