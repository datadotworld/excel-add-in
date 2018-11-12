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

import UploadModal from '../../components/UploadModal';

it('renders modal', () => {
  expect(renderer.create(
    <UploadModal
      getSelectionRange = {
        () => {
          return new Promise((resolve) => {
            resolve(1);
          });
        }
      }
    />
    ).toJSON()).toMatchSnapshot()
});

it('renders modal - with range', () => {
  expect(renderer.create(
    <UploadModal
      range={{
        rowCount: 4,
        columnCount: 2,
        address: 'Sheet1!A2:B5'
      }}
      excelApiSupported
      linkConnector = {() => {}}
      getSelectionRange = {
        () => {
          return new Promise((resolve) => {
            resolve(1);
          });
        }
      }
      
    />
  ).toJSON()).toMatchSnapshot()
});

it('renders modal - with options', () => {
  const options = {
    filename: 'test1.csv'
  };
  expect(renderer.create(
    <UploadModal
      range={{
        rowCount: 4,
        columnCount: 2,
        address: 'Sheet1!A2:B5'
      }}
      options={options}
      excelApiSupported
      linkConnector = {() => {}}
      getSelectionRange = {
        () => {
          return new Promise((resolve) => {
            resolve();
          });
        }
      }
    />
  ).toJSON()).toMatchSnapshot()
});

it ('removes trailing .csv from filenames', () => {
  const modal = new UploadModal({options: {}});
  modal.state.name = 'testing.csv'
  expect(modal.getFilename()).toBe('testing');
});

it ('does not impact filenames without trailing .csv', () => {
  const modal = new UploadModal({options: {}});
  modal.state.name = 'testingwithoutextension'
  expect(modal.getFilename()).toBe('testingwithoutextension');
});