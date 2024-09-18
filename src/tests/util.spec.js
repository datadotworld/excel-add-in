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
  hasDuplicateName,
  createWorkspaceLink,
  createItemLink,
  withWriteAccess,
  getDestination
} from '../util';

describe('util functions', () => {
  describe('getDestination', () => {
    it('should return dataset details given a URL or slug', () => {
      const dataset = { owner: 'owner', id: 'dataset' };
  
      const slug = 'owner/dataset';
      const singleTenantUrl = 'https://customer.data.world/owner/dataset';
      const singleTenantUrlWithParams =
        'https://customer.data.world/owner/dataset/?first=foo&second=bar';
      const multiTenantUrl = 'https://data.world/owner/dataset';
      const multiTenantUrlWithParams =
        'https://data.world/owner/dataset/?first=foo&second=bar';
      const privateInstanceUrl =
        'https://internal.app.data.world/owner/dataset';
      const privateInstanceUrlWithParams =
        'https://internal.app.data.world/owner/dataset/?first=foo&second=bar';
  
      const invalidSlug = 'invalid/dataset/slug';
      const invalidUrl = 'https://randomwebsite.com/owner/dataset';
  
      expect(getDestination(slug)).toEqual(dataset);
      expect(getDestination(singleTenantUrl)).toEqual(dataset);
      expect(getDestination(singleTenantUrlWithParams)).toEqual(dataset);
      expect(getDestination(multiTenantUrl)).toEqual(dataset);
      expect(getDestination(multiTenantUrlWithParams)).toEqual(dataset);
      expect(getDestination(privateInstanceUrl)).toEqual(dataset);
      expect(getDestination(privateInstanceUrlWithParams)).toEqual(dataset);
  
      expect(getDestination(invalidSlug)).toEqual(null);
      expect(getDestination(invalidUrl)).toEqual(null);
    });
  });
  
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

  describe('createWorkspaceLink', () => {
    it('should return a workspace link', () => {
      const dataset = { owner: 'owner', id: 'dataset' };

      const expected = 'https://data.world/owner/dataset/workspace/';
      const actual = createWorkspaceLink(dataset);

      expect(expected).toEqual(actual);
    });
  });

  describe('createItemLink', () => {
    it('should return a table link', () => {
      const dataset = { owner: 'owner', id: 'dataset' };
      const item = { name: 'data' };

      const expected =
        'https://data.world/owner/dataset/workspace/query?autorunQuery=true&newQueryContent=SELECT%20%2A%20FROM%20data&newQueryType=SQL';
      const actual = createItemLink(dataset, item);

      expect(expected).toEqual(actual);
    });

    it('should return a query link', () => {
      const dataset = { owner: 'owner', id: 'dataset' };
      const item = {
        name: 'aQuery',
        id: '1234-5678'
      };

      const expected =
        'https://data.world/owner/dataset/workspace/query?queryid=1234-5678';
      const actual = createItemLink(dataset, item, true);

      expect(expected).toEqual(actual);
    });
  });

  describe('withWriteAccess', () => {
    it('should return datasets with ADMIN or WRITE accessLevel', () => {
      const datasets = [
        {
          accessLevel: 'ADMIN',
          id: 'foo',
          owner: 'tom'
        },
        {
          accessLevel: 'WRITE',
          id: 'far',
          owner: 'dick'
        },
        {
          accessLevel: 'READ',
          id: 'baz',
          owner: 'harry'
        },
        {
          accessLevel: 'WRITE',
          id: 'foo',
          owner: 'tom'
        },
        {
          accessLevel: 'READ',
          id: 'far',
          owner: 'dick'
        },
        {
          accessLevel: 'WRITE',
          id: 'baz',
          owner: 'harry'
        }
      ];
      const expected = [
        {
          accessLevel: 'ADMIN',
          id: 'foo',
          owner: 'tom'
        },
        {
          accessLevel: 'WRITE',
          id: 'far',
          owner: 'dick'
        },
        {
          accessLevel: 'WRITE',
          id: 'foo',
          owner: 'tom'
        },
        {
          accessLevel: 'WRITE',
          id: 'baz',
          owner: 'harry'
        }
      ];
      const actual = withWriteAccess(datasets);

      expect(actual).toEqual(expected);
    });
  });
});
