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
import {
  sortByOwnerAndTitle,
  createSubArrays,
  hasDuplicateName
} from '../util';

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

  describe('createSubArrays', () => {
    it('should create subarrays when specified length fits array', () => {
      const array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const expected = [[1, 2], [3, 4], [5, 6], [7, 8], [9, 10]];
      const actual = createSubArrays(array, 2);

      expect(actual).toEqual(expected);
    });

    it('should create subarrays when specified length does not fit array length', () => {
      const array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
      const expected = [[1, 2], [3, 4], [5, 6], [7, 8], [9, 10], [11]];
      const actual = createSubArrays(array, 2);

      expect(actual).toEqual(expected);
    });
  });

  describe('hasDuplicateName', () => {
    it('should return true if there is a clash', () => {
      const array = [
        { name: 'foo', dataset: 'sparkle' },
        { name: 'bar', dataset: 'sparkle' },
        { name: 'baz', dataset: 'sparkle' },
        { name: 'foo', dataset: 'squad' }
      ];
      const expected = true;
      const actual = hasDuplicateName(
        { name: 'foo', dataset: 'sparkle' },
        array
      );

      expect(actual).toEqual(expected);
    });

    it('should return false if there is no clash', () => {
      const array = [
        { name: 'foo', dataset: 'sparkle' },
        { name: 'bar', dataset: 'sparkle' },
        { name: 'baz', dataset: 'sparkle' }
      ];
      const expected = false;
      const actual = hasDuplicateName(
        { name: 'foo', dataset: 'sparkle' },
        array
      );

      expect(actual).toEqual(expected);
    });
  });
});
