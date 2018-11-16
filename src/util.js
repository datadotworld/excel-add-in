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
import { SHEET_RANGE } from './constants';

export function getDisplayRange(rangeAddress) {
  if (rangeAddress) {
    const [sheet, range] = rangeAddress.split('!');
    if (range === SHEET_RANGE) {
      return sheet.replace(/'/g, '');
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
  const parsedPartialUrl = url.split('/');

  if (parsedPartialUrl.length === 2) {
    return {
      owner: parsedPartialUrl[0],
      id: parsedPartialUrl[1]
    };
  }

  const regexMatch = /https:\/\/data\.world\/([^/?#]*)\/([^/?#]*)?/;
  const parsedFullUrl = url.match(regexMatch);

  if (parsedFullUrl) {
    return {
      owner: parsedFullUrl[1],
      id: parsedFullUrl[2]
    };
  }

  return null;
}
