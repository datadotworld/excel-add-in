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

import { SHEET_RANGE, SHEET_RANGE_COLUMNS } from './constants';
import queryString from 'query-string';
import { values } from 'lodash';

export function getDisplayRange(rangeAddress, sheetName) {
  if (rangeAddress) {
    const [sheet, range] = rangeAddress.split('!');
    if (range === SHEET_RANGE || range === SHEET_RANGE_COLUMNS) {
      return sheetName || sheet.replace(/'/g, '');
    }

    if (sheetName) {
      return `${sheetName}, ${range}`;
    }

    return rangeAddress.replace(/'/g, '');
  } else {
    return 'Undefined';
  }
}

export function b64toBlob(imageString) {
  const sliceSize = 512;
  const byteCharacters = atob(imageString);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);

    let byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  const blob = new Blob(byteArrays, { type: 'image/png' });

  return blob;
}

export function groupAndSortProjects(projects) {
  // Sort projects first by owner then by id
  projects.sort((firstProject, secondProject) => {
    if (firstProject.owner === secondProject.owner) {
      if (firstProject.id < secondProject.id) {
        return -1;
      } else if (firstProject.id > secondProject.id) {
        return 1;
      }
      return 0;
    } else {
      if (firstProject.owner < secondProject.owner) {
        return -1;
      }
      return 1;
    }
  });

  return projects;
}

export function generateChartError(charts, failedToLoad) {
  if (charts.length > 1) {
    // All the charts failed to load
    if (charts.length === failedToLoad) {
      return `${failedToLoad} charts were detected but cannot be displayed. To use them in insights, try changing their chart type.`;
    } else {
      // Some charts failed to load
      if (failedToLoad === 1) {
        return '1 additional chart was detected but cannot be displayed. To use it in insights, try changing its chart type.';
      } else {
        return `${failedToLoad} additional charts were detected but cannot be displayed. To use them in insights, try changing their chart type.`;
      }
    }
  } else {
    // Only one chart present and it failed to load
    return '1 chart was detected but cannot be displayed. To use it in insights, try changing its chart type.';
  }
}

export function getDestination(url) {
  const regexMatch = /^(?:https:\/\/(?:[a-zA-Z0-9-]+\.)?(?:app\.)?data\.world\/)?([^/?#]+)\/([^/?#]+)$/;
  const parsedUrl = url.match(regexMatch);

  if (parsedUrl) {
    return {
      owner: parsedUrl[1],
      id: parsedUrl[2]
    }
  };
  return null;
}

export function sortByOwnerAndTitle(datasets) {
  return datasets.sort((a, b) => {
    // First sort by owner
    if (a.owner < b.owner) {
      return -1;
    }

    if (a.owner > b.owner) {
      return 1;
    }

    // Same owner, sort by title
    if (a.title < b.title) {
      return -1;
    }

    if (a.title > b.title) {
      return 1;
    }

    return 0;
  });
}

export function getExcelColumn(number) {
  // TODO: Make recursive and support 3 letters
  const charCodeOfA = 'A'.charCodeAt(0),
    alphabetLength = 'Z'.charCodeAt(0) - charCodeOfA + 1;

  const numberToLetters = (num) => {
    if (num <= alphabetLength) {
      return convertNumberToLetter(num);
    } else {
      const firstNumber = Math.floor((num - 1) / alphabetLength);
      const firstLetter = convertNumberToLetter(firstNumber);

      const secondNumber = num % alphabetLength || alphabetLength;
      const secondLetter = convertNumberToLetter(secondNumber);

      return firstLetter + secondLetter;
    }
  };

  const convertNumberToLetter = (num) => {
    const charCode = charCodeOfA + num - 1;
    return String.fromCharCode(charCode);
  };

  return numberToLetters(number);
}

export function parseData(data) {
  const columns = Object.keys(data[0]);
  const dataValues = data.map((row) => values(row));

  return [columns, ...dataValues];
}

export function createSubArrays(array, subArrayLength) {
  const result = [];

  while (array.length > 0) {
    result.push(array.splice(0, subArrayLength));
  }
  return result;
}

export function hasDuplicateName({ name, dataset }, array) {
  const withSameName = array.filter(
    (element) => element.name === name && element.dataset !== dataset
  ).length;

  return withSameName > 0;
}

export function createWorkspaceLink(dataset) {
  return `https://data.world/${dataset.owner}/${dataset.id}/workspace/`;
}

export function createItemLink(dataset, item, isQuery) {
  const base = `https://data.world/${dataset.owner}/${
    dataset.id
  }/workspace/query?`;

  let query;

  if (isQuery) {
    query = queryString.stringify({ queryid: item.id });
  } else {
    query = queryString.stringify({
      newQueryContent: `SELECT * FROM ${item.name}`,
      newQueryType: 'SQL',
      autorunQuery: 'true'
    });
  }

  return base + query;
}

export function withWriteAccess(datasets) {
  return datasets.filter(
    ({ accessLevel }) => accessLevel === 'ADMIN' || accessLevel === 'WRITE'
  );
}
