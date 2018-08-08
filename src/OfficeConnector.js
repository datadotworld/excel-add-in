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
let Office, Excel;

const lastRowsAreEmpty = function (array) {
  if (array.length < 10) {
    return false;
  }
  for (let i = array.length - 1; i >= array.length - 10; i -= 1) {
    if (!!array[i].join('')) {
      return false;
    }
  }
  return true;
};

export default class OfficeConnector {
  initialize () {
    Office = window.Office;
    return new Promise((resolve, reject) => {
      if (Office) {
        Office.initialize = (reason) => {
          if (this.isExcelApiSupported()) {
            Excel = window.Excel;
          }

          Office.context.document.settings.set('Office.AutoShowTaskpaneWithDocument', true);
          Office.context.document.settings.saveAsync();

          resolve();
        }
      } else {
        reject();
      }
    });
  }

  isExcelApiSupported () {
    if(Office) {
      return Office.context.requirements.isSetSupported('ExcelApi', '1.1');
    }
  }

  isCSV () {
    return /.*\.csv$/.test(Office.context.document.url.toLowerCase());
  }

  getBindingRange (binding) {
    return new Promise((resolve, reject) => {
      if (!this.isExcelApiSupported()) {
        return resolve();
      }
      Excel.run((ctx) => {
        const range = ctx.workbook.bindings.getItem(binding.id).getRange().load('address');
        return ctx.sync().then(() => {
          binding.rangeAddress = range.address;
          resolve();
        }).catch(resolve);
      });
    });
  }

  getBindings () {
    return new Promise((resolve, reject) => {
      Office.context.document.bindings.getAllAsync((result) => {
        if (result.status === Office.AsyncResultStatus.Failed) {
          return reject(result.error.message);
        }
        const bindings = [];
        const promises = [];
        result.value.forEach((binding) => {
          if (binding.id.indexOf('dw::') === 0) {
            bindings.push(binding);
            promises.push(this.getBindingRange(binding));
          }
        });
        Promise.all(promises).then(() => {
          resolve(bindings);
        }).catch(reject);
      });
    });
  }

  createSelectionRange(sheetId, rangeAddress) {
    return new Promise((resolve, reject) => {
      if (!this.isExcelApiSupported()) {
        return resolve();
      }
      Excel.run(function(ctx) {
        // Make each namedItem unique to prevent `already exists` errors
        const namedItem = 'name' + new Date().getTime().toString();
        const range = ctx.workbook.worksheets
          .getItem(sheetId)
          .getRange(rangeAddress);
        const namedItemCollection = ctx.workbook.names;
        namedItemCollection.add(namedItem, range, 'Range as a name');
        return ctx.sync()
          .then(resolve(namedItem))
          .catch(reject);
      });
    });
  }

  createBinding(name, namedItem) {
    return new Promise((resolve, reject) => {
      // Create binding after Excel sync to have access to newly added nameditem
      Excel.run((ctx) => {
        return ctx.sync().then(() => {
          Office.context.document.bindings.addFromNamedItemAsync(
            namedItem,
            Office.BindingType.Matrix,
            { id: `dw::${name}` },
            result => {
              if (result.status === Office.AsyncResultStatus.Failed) {
                return reject(result.error.message);
              }
              resolve(result.value);
            }
          );
        }).catch(reject);
      });
    })
  }

  removeBinding (binding) {
    return new Promise((resolve, reject) => {
      Office.context.document.bindings.releaseByIdAsync(binding.id, (result) => {
        if (result.status === Office.AsyncResultStatus.Failed) {
          return reject(result.error.message);
        }
        resolve();
      });
    });
  }

  getSettings () {
    return {
      dataset: Office.context.document.settings.get('dataset'),
      syncStatus: Office.context.document.settings.get('syncStatus')
    };
  }

  saveSettings () {
    return new Promise((resolve, reject) => {
      Office.context.document.settings.saveAsync((result) => {
        if (result.status === Office.AsyncResultStatus.Failed) {
          return reject(result.error.message);
        }
        resolve();
      });
    });
  }

  setSyncStatus (syncStatus) {
    Office.context.document.settings.set('syncStatus', syncStatus);
    return this.saveSettings();
  }

  setDataset (dataset) {
    Office.context.document.settings.set('dataset', dataset);
    return this.saveSettings();
  }

  listenForChanges (binding, callback) {
    const bindingId = `bindings#${binding.id}`;
    Office.select(bindingId).removeHandlerAsync(Office.EventType.BindingDataChanged, () => {
      Office.select(bindingId).addHandlerAsync(Office.EventType.BindingDataChanged, callback);
    });
  }

  listenForSelectionChanges (callback) {
    if (this.isExcelApiSupported()) {
      Office.context.document.addHandlerAsync('documentSelectionChanged', (e) => {
        this.getCurrentlySelectedRange().then(callback);
      });
    }
  }

  stopListeningForSelectionChanges () {
    if (this.isExcelApiSupported()) {
      Office.context.document.removeHandlerAsync('documentSelectionChanged', {}, () => {});
    }
  }

  getCurrentlySelectedRange () {
    return new Promise((resolve, reject) => {
      if (!this.isExcelApiSupported()) {
        return resolve();
      }
      Excel.run((ctx) => {
        const range = ctx.workbook.getSelectedRange()
          .load(['columnCount', 'rowCount', 'address', 'worksheet']);
        return ctx.sync().then(() => {
          resolve(range);
        });
      });
    });
  }

  select (address = '') {
    const addressSections = address.split('!');
    return new Promise((resolve, reject) => {
      if (!this.isExcelApiSupported()) {
        return resolve();
      }
      Excel.run(function (ctx) {
        // Sheet names with spaces have quotes around them
        const sheetName = addressSections[0].replace(/'/g, '');
        const rangeAddress = addressSections[1];
        const range = ctx.workbook.worksheets.getItem(sheetName).getRange(rangeAddress);
        range.select();
        return ctx.sync().then(resolve);
      });;
    });
  }

  activateSheet (sheet) {
    return new Promise((resolve, reject) => {
      if (!this.isExcelApiSupported()) {
        return resolve();
      }
      Excel.run(function (ctx) {
        var worksheet = ctx.workbook.worksheets.getItem(sheet);
        worksheet.activate();
        return ctx.sync().then(resolve);
      });;
    });
  }

  getData (binding) {
    return new Promise((resolve, reject) => {
      const {columnCount, rowCount} = binding;
      const rowInterval = 1000;
      const results = [];

      const organizeResults = () => {
        results.sort((a, b) => {
          return a.options.startRow - b.options.startRow;
        });

        let data = [];
        results.forEach((result) => {
          data = data.concat(result.value);
        });
        resolve(data);
      };

      const handleData = (options) => {
        return (result) => {
          if (result.status === Office.AsyncResultStatus.Failed) {
            return reject(result.error.message);
          }

          results.push({options, value: result.value});
          // Check the last 10 rows for empty values
          if (options.startRow + options.rowCount < rowCount && !lastRowsAreEmpty(result.value)) {
            const newOptions = {
              columnCount,
              startRow: options.startRow + options.rowCount,
              startColumn: 0,
              rowCount: Math.min(rowInterval, rowCount - (options.startRow + options.rowCount)),
              valueFormat: Office.ValueFormat.Formatted
            };
            binding.getDataAsync(newOptions, handleData(newOptions));
          } else {
            organizeResults();
          }
        }
      };
      
      // The maximum number of columns is 16384
      // https://support.office.com/en-us/article/Excel-specifications-and-limits-1672b34d-7043-467e-8e27-269d656771c3
      // Experimentation indicates that 1m is the maximum number of cells retrievable at any one time
      // A maximum number of columns is enforced on the binding, dynamically determine how many rows to fetch
      const options = {
        columnCount,
        startRow: 0,
        startColumn: 0,
        rowCount: Math.min(rowInterval, rowCount),
        valueFormat: Office.ValueFormat.Formatted
      };
      binding.getDataAsync(options, handleData(options));
    });
  }

  getCharts(sheetName) {
    return new Promise((resolve, reject) => {
      if (!this.isExcelApiSupported()) {
        return resolve();
      }
      Excel.run((ctx) => {
        // Load all charts in the specified worksheet
        let charts = ctx.workbook.worksheets.getItem(sheetName).charts;
        charts.load('items');
        return ctx.sync().then(() => {
          charts = charts.items.map(chart => {
            return { sheet: sheetName, chartName: chart.name }
          });

          // Return array of objects containing the chart names and worksheet
          resolve(charts);
        }).catch (reject);
      });
    });
  }

  getImageAndTitle(sheetId, chartName) {
    return new Promise((resolve, reject) => {
      Excel.run((ctx) => {
        // Get chart using the sheet id and chart name
        const chart = ctx.workbook.worksheets.getItem(sheetId).charts.getItem(chartName);

        // Load the chart's title and b64 image string
        const title = chart.title;
        title.load('text');
        const image = chart.getImage();
        return ctx.sync().then(() => {
          // Return the base64 string representation of the chart
          resolve({ image: image.value, title: title.text });
        }).catch (reject);
      });
    });
  }

  getWorksheets() {
    return new Promise((resolve, reject) => {
      if (!this.isExcelApiSupported()) {
        return resolve();
      }
      Excel.run((ctx) => {
        const worksheets = ctx.workbook.worksheets;
        worksheets.load('items');
        return ctx.sync().then(() => {
          resolve(worksheets.items);
        }).catch(reject)
      });
    });
  }
}
