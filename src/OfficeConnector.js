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
        });
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
        });
      });
    });
  }

  createBinding (name) {
    return new Promise((resolve, reject) => {
      Office.context.document.bindings.addFromPromptAsync(Office.BindingType.Matrix, { id: `dw::${name}` }, (result) => {
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
    Office.select(`bindings#${binding.id}`).addHandlerAsync(Office.EventType.BindingDataChanged, callback);
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