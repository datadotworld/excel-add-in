/*
 * Copyright 2018 data.world, Inc.
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
import { sortByOwnerAndTitle } from '../util';

describe('util functions', () => {
  describe('sortByOwnerAndTitle', () => {
    it('should sort datasets from the same owner by title', () => {
      const datasets = [
        { owner: 'arnold', title: 'cars' },
        { owner: 'arnold', title: 'zebras' },
        { owner: 'arnold', title: 'bananas' },
        { owner: 'arnold', title: 'nations' },
        { owner: 'arnold', title: 'stars' },
        { owner: 'arnold', title: 'pets' }
      ];
      const expected = [
        { owner: 'arnold', title: 'bananas' },
        { owner: 'arnold', title: 'cars' },
        { owner: 'arnold', title: 'nations' },
        { owner: 'arnold', title: 'pets' },
        { owner: 'arnold', title: 'stars' },
        { owner: 'arnold', title: 'zebras' }
      ];
      const actual = sortByOwnerAndTitle(datasets);

      expect(actual).toEqual(expected);
    });

    it('should sort datasets from the different owners by owner', () => {
      const datasets = [
        { owner: 'arnold', title: 'cars' },
        { owner: 'benard', title: 'cars' },
        { owner: 'charles', title: 'cars' },
        { owner: 'benard', title: 'cars' },
        { owner: 'arnold', title: 'cars' },
        { owner: 'charles', title: 'cars' }
      ];
      const expected = [
        { owner: 'arnold', title: 'cars' },
        { owner: 'arnold', title: 'cars' },
        { owner: 'benard', title: 'cars' },
        { owner: 'benard', title: 'cars' },
        { owner: 'charles', title: 'cars' },
        { owner: 'charles', title: 'cars' }
      ];
      const actual = sortByOwnerAndTitle(datasets);

      expect(actual).toEqual(expected);
    });

    it('should sort datasets by owner then title', () => {
      const datasets = [
        { owner: 'arnold', title: 'cars' },
        { owner: 'benard', title: 'trains' },
        { owner: 'charles', title: 'horses' },
        { owner: 'benard', title: 'elephants' },
        { owner: 'arnold', title: 'bananas' },
        { owner: 'charles', title: 'giraffes' }
      ];
      const expected = [
        { owner: 'arnold', title: 'bananas' },
        { owner: 'arnold', title: 'cars' },
        { owner: 'benard', title: 'elephants' },
        { owner: 'benard', title: 'trains' },
        { owner: 'charles', title: 'giraffes' },
        { owner: 'charles', title: 'horses' }
      ];
      const actual = sortByOwnerAndTitle(datasets);

      expect(actual).toEqual(expected);
    });
  });
});
