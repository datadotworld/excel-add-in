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
import axios from 'axios';
import papa from 'papaparse';
import { b64toBlob, groupAndSortProjects } from './util';

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
      const timestamp = new Date().getTime();
      this.api.get(`/datasets/${slug}?ts=${timestamp}`).then((result) => {
        resolve(result.data);
      }).catch(reject);
    });
    
  }

  getDatasets () {
    return new Promise((resolve, reject) => {
      let datasets = [];
      Promise.all([
        this.api.get('/user/datasets/own', {params: {limit: 500}}),
        this.api.get('/user/datasets/contributing', {params: {limit: 500}})
      ]).then((results) => {
        results.forEach((result) => {
          datasets = datasets.concat(result.data.records);
        });
        resolve(datasets);
      }).catch(reject);
    });
  }

  getProjects () {
    return new Promise((resolve, reject) => {
      let projects = [];
      Promise.all([
        this.api.get('/user/projects/own', {params: {limit: 500}}),
        this.api.get('/user/projects/contributing', {params: {limit: 500}})
      ]).then((results) => {
        results.forEach((result) => {
          projects = projects.concat(result.data.records);
        });

        // Only display projects for which the user has write rights
        projects = projects.filter(project => {
          const { accessLevel } = project;
          if (accessLevel === 'ADMIN' || accessLevel === 'WRITE') {
            return true;
          }

          return false;
        })

        // Sort the projects before resolving
        projects = groupAndSortProjects(projects);
        resolve(projects);
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

  createProject (userId, project) {
    return new Promise((resolve, reject) => {
      this.api.post(`/projects/${userId}`, project).then((result) => {
        resolve(result.data);
      }).catch(reject);
    });
  }

  uploadFile (options) {
    const {dataset, filename} = options;
    const datasetSlug = `${dataset.owner}/${dataset.id}`;

    const csv = papa.unparse(options.data);

    const formData = new FormData();
    
    // Use this structure so that it works correctly in Safari
    const blob = new Blob([csv]);
    formData.append('file', blob, filename);

    return this.api.post(`/uploads/${datasetSlug}/files`, formData);
  }

  uploadInsight(options) {
    const { title, project, description } = options;
    return new Promise((resolve, reject) => {
      const uriTitle = encodeURIComponent(title);
      this.api.post(`/insights/${project.owner}/${project.id}`, {
        title,
        description,
        body: {
          imageUrl:
            `https://data.world/api/${project.owner}/dataset/${project.id}/file/raw/${uriTitle}.png`
        }
      }).then((result) => {
        // Return the URL to the newly created insight
        resolve(result.data.uri);
      }).catch(reject);
    });
  }

  uploadChart (imageString, options) {
    const { title, project } = options;
    return new Promise((resolve, reject) => {
      // Convert base64 string into a binary large object
      const blob = b64toBlob(imageString);

      // Add blob to a FormData object for uploading
      var formData = new FormData();
      formData.append('file', blob, `${title}.png`);

      // First upload the image
      return this.api.post(`/uploads/${project.owner}/${project.id}/files`, formData).then(res => {
        // Then use the uploaded image to create an insight
        this.uploadInsight(options).then(url => {
          resolve(url);
        })
      }).catch(reject)
    });
  }
}
