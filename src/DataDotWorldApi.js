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
import { b64toBlob, groupAndSortProjects, hasWriteAccess } from './util';

export default class DataDotWorldApi {
  constructor(token) {
    this.api = axios.create({
      baseURL: 'https://api.data.world/v0',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  async getLibraryRecursive(endpoint, partial = [], next) {
    if (next === -1) {
      return partial;
    }

    let params = {
      params: {
        limit: 100,
        next: next,
        fields: 'id,owner,title,accessLevel,created,updated'
      }
    };

    const result = await this.api.get(endpoint, params);

    return this.getLibraryRecursive(
      endpoint,
      partial.concat(result.data.records),
      result.data['nextPageToken'] || -1
    );
  }

  async getDatasets(onlyShowWritableDatasets) {
    let datasets = [];

    const results = await Promise.all([
      this.getLibraryRecursive('/user/datasets/own'),
      this.getLibraryRecursive('/user/datasets/contributing')
    ]);

    results.forEach((result) => {
      datasets = datasets.concat(result);
    });

    if (onlyShowWritableDatasets) {
      datasets = hasWriteAccess(datasets);
    }

    return datasets;
  }

  async getProjects() {
    let projects = [];
    const results = await Promise.all([
      this.getLibraryRecursive('/user/projects/own'),
      this.getLibraryRecursive('/user/projects/contributing')
    ]);

    results.forEach((result) => {
      projects = projects.concat(result);
    });

    // Only display projects for which the user has write rights
    projects = hasWriteAccess(projects);

    // Sort the projects before resolving
    projects = groupAndSortProjects(projects);

    return projects;
  }

  async getUser() {
    const { data } = await this.api.get('/user');

    return data;
  }

  async createDataset(userId, { title, visibility }) {
    const { data } = await this.api.post(`/datasets/${userId}`, {
      title,
      visibility
    });

    return data;
  }

  async createProject(userId, { title, visibility, objective }) {
    const { data } = await this.api.post(`/projects/${userId}`, {
      title,
      visibility,
      objective
    });

    return data;
  }

  uploadFile(options) {
    const { dataset, filename } = options;

    const datasetSlug = `${dataset.owner}/${dataset.id}`;

    const csv = papa.unparse(options.data);

    const formData = new FormData();

    // Use this structure so that it works correctly in Safari
    const blob = new Blob([csv]);
    formData.append('file', blob, filename);

    return this.api.post(`/uploads/${datasetSlug}/files`, formData);
  }

  async uploadInsight(options) {
    const { title, project, description } = options;
    const uriTitle = encodeURIComponent(title);
    const {
      data: { uri }
    } = await this.api.post(`/insights/${project.owner}/${project.id}`, {
      title,
      description,
      body: {
        imageUrl: `https://data.world/api/${project.owner}/dataset/${
          project.id
        }/file/raw/${uriTitle}.png`
      }
    });

    return uri;
  }

  async uploadChart(imageString, options) {
    const { title, project } = options;

    // Convert base64 string into a binary large object
    const blob = b64toBlob(imageString);

    // Add blob to a FormData object for uploading
    var formData = new FormData();
    formData.append('file', blob, `${title}.png`);

    // First upload the image
    await this.api.post(
      `/uploads/${project.owner}/${project.id}/files`,
      formData
    );

    // Then use the uploaded image to create an insight
    const url = await this.uploadInsight(options);

    return url;
  }

  async getQueries(dataset) {
    const {
      data: { records }
    } = await this.api.get(`/datasets/${dataset.owner}/${dataset.id}/queries`);

    return records;
  }

  async executeQuery(dataset, query) {
    const { data } = await this.api.post(
      `/sql/${dataset.owner}/${dataset.id}/`,
      {
        query
      }
    );

    return data;
  }

  async getTables(dataset) {
    const result = await this.executeQuery(dataset, 'SELECT * FROM Tables');

    return result;
  }

  async getTable(dataset, table) {
    const result = await this.executeQuery(
      dataset,
      `SELECT * FROM \`${table.owner}\`.\`${table.dataset}\`.\`${table.name}\``
    );

    return result;
  }

  async getQuery(queryId) {
    const { data } = await this.api.get(`queries/${queryId}/results`);

    return data;
  }
}
