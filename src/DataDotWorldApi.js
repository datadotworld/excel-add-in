import axios from 'axios';

const datasetRegex = /^https?:\/\/data\.world\/(.+\/.+)$/

export default class DataDotWorldApi {
  constructor (token) {
    this.api = axios.create({
      baseURL: 'https://api.data.world/v0',
      headers: {
        'Authorization': `Bearer ${token}` 
      }
    });
  }

  getDataset (dataset) {
    let slug = dataset;
    if (dataset.indexOf('http') >= 0) {
      slug = dataset.match(datasetRegex)[1];
    }
    return new Promise((resolve, reject) => {
      this.api.get(`/datasets/${slug}`).then((result) => {
        resolve(result.data);
      }).catch(reject);
    });
    
  }

  getDatasets () {
    return new Promise((resolve, reject) => {
      let datasets = [];
      Promise.all([
        this.api.get('/user/datasets/own'),
        this.api.get('/user/datasets/contributing')
      ]).then((results) => {
        results.forEach((result) => {
          datasets = datasets.concat(result.data.records);
        });
        resolve(datasets);
      }).catch(reject);
    });
  }

  getUser () {
    return new Promise((resolve, reject) => {
      this.api.get('/user').then((result) => {
        resolve(result.data);
      }).catch(reject);
    });
  }

  createDataset (userId, dataset) {
    return new Promise((resolve, reject) => {
      this.api.post(`/datasets/${userId}`, dataset).then((result) => {
        resolve(result.data);
      }).catch(reject);
    });
  }

  uploadFile (options) {
    const {dataset, filename} = options;
    const datasetSlug = `${dataset.owner}/${dataset.id}`;

    const csv = options.data.map((row) => {
      return row.join(',');
    }).join('\n');

    const formData = new FormData();
    
    // Use this structure so that it works correctly in Safari
    const blob = new Blob([csv]);
    formData.append('file', blob, filename);

    return this.api.post(`/uploads/${datasetSlug}/files`, formData);
  }
}