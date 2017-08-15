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

export default class OfficeConnector {
  initialize () {
    Office = window.Office;
    return new Promise((resolve, reject) => {
      if (Office) {
        Office.initialize = (reason) => {
          if (!Office.context.requirements.isSetSupported('ExcelApi', '1.1')) {
            return reject('Need Office 2016 or greater');
          }
          Excel = window.Excel;

          resolve();
        }
      } else {
        reject();
      }
    });
  }

  getBindingRange (binding) {
    return new Promise((resolve, reject) => {
      Excel.run((ctx) => {
        const range = ctx.workbook.bindings.getItem(binding.id).getRange().load('address');
        return ctx.sync().then(() => {
          binding.rangeAddress = range.address;
          resolve();
        }).catch(reject);
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
            // TODO: an error getting the binding range can cause things to fail
            // further down the line
            promises.push(this.getBindingRange(binding));
          }
        });
        Promise.all(promises).then(() => {
          resolve(bindings);
        }).catch(reject);
      });
    });
  }

  createBinding (name, options) {
    return new Promise((resolve, reject) => {
      Office.context.document.bindings.addFromSelectionAsync(Office.BindingType.Matrix, { id: `dw::${name}` }, (result) => {
        if (result.status === Office.AsyncResultStatus.Failed) {
          return reject(result.error.message);
        }
        resolve(result.value);
      });
    });
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
    Office.context.document.addHandlerAsync('documentSelectionChanged', () => {
      this.getCurrentlySelectedRange().then(callback);
    });
  }

  stopListeningForSelectionChanges () {
    Office.context.document.removeHandlerAsync('documentSelectionChanged', {}, () => {});
  }

  getCurrentlySelectedRange () {
    return new Promise((resolve, reject) => {
      Excel.run((ctx) => {
        const range = ctx.workbook.getSelectedRange().load('address');;
        return ctx.sync().then(() => {
          resolve(range.address);
        });
      });
    });
  }

  select (address = '') {
    const addressSections = address.split('!');
    return new Promise((resolve, reject) => {
      Excel.run(function (ctx) {
        const sheetName = addressSections[0];
        const rangeAddress = addressSections[1];
        const range = ctx.workbook.worksheets.getItem(sheetName).getRange(rangeAddress);
        range.select();
        return ctx.sync().then(resolve);
      });;
    });
  }

  getData (binding) {
    return new Promise((resolve, reject) => {
      const {columnCount, rowCount} = binding;
      const results = [];
      let count = 0;

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

          count -= 1;
          results.push({options, value: result.value});
          
          if (count === 0) {
            organizeResults();
          }
        }
      };
      
      // The maximum number of columns is 16384
      // https://support.office.com/en-us/article/Excel-specifications-and-limits-1672b34d-7043-467e-8e27-269d656771c3
      // Experimentation indicates that 1m is the maximum number of cells retrievable at any one time
      // A maximum number of columns is enforced on the binding, dynamically determine how many rows to fetch
      const rowInterval = Math.floor(1000000 / columnCount);
      for (let i = 0; i < rowCount; i += rowInterval) {
        const options = {
          columnCount,
          startRow: i,
          startColumn: 0,
          rowCount: Math.min(rowInterval, rowCount - i)
        };
        count += 1;
        binding.getDataAsync(options, handleData(options));
      }
    });
  }
}