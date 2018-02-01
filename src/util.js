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
import { MAX_ROWS, MAX_COLUMNS } from './constants';

export function isSheetBinding(binding) {
  if (binding.rowCount === MAX_ROWS && binding.columnCount === MAX_COLUMNS) {
    return true;
  } else {
    return false;
  }
}

export function getSheetName(binding) {
  const rangeAddress = binding.rangeAddress
  return rangeAddress
    // Extract sheet name from cell range
    .substring(0, rangeAddress.indexOf('!'))
    // Remove quotation marks from sheet names containing a space
    .replace(/'/g, '');
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

  const blob = new Blob(byteArrays, {type: 'image/png'});

  return blob;
}
