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

import UploadInsight from '../../components/UploadInsight';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<UploadInsight projects={[{ owner: 'owner', id: "project"}]}/>, div);
});

it('renders upload insight view', () => {
  const getImageAndTitle = () => {
    return new Promise((resolve, reject) => {
      resolve({ image: 'b64string', title: 'A Title' });
    })
  }

  const selectedChart = 'b64ImageString'
  const projects = [
    { owner: 'firstOwner', id: "firstProject"},
    { owner: 'firstOwner', id: "secondProject"},
    { owner: 'secondOwner', id: "firstProject"},
    { owner: 'secondOwner', id: "secondProject"},
  ]

  expect(renderer.create(<UploadInsight
    chart={selectedChart}
    projects={projects}
  />).toJSON()).toMatchSnapshot()
});
