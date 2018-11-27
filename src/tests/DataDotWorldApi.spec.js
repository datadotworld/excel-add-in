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
import papa from 'papaparse';

const testData = [
  [1, 2, 3], // normal data
  [1, '2, 3, 4', 5], // data with commas
  ['10/12/2012', '17%', 0.123], // mixed data
  ['this is a test\nof a newline', '', ''], //newline and empty data
  ['this is a "quotation mark" test', '', ''] // quotation test
];

it('correctly encodes data into a CSV', () => {
  expect(papa.unparse(testData)).toMatchSnapshot();
});
