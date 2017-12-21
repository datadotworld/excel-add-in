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
export const MAX_ROWS = 1048576;
export const MAX_COLUMNS = 150;
export const MAX_FILENAME_LENGTH = 128;

export const SHEET_RANGE = `A1:ET${MAX_ROWS}`;
export const MAX_COLUMNS_ERROR = `The maximum number of columns is ${MAX_COLUMNS}.  If you need to bind to more columns than that, please upload your Excel file to data.world directly. `;
