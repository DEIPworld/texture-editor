/* global FormData */
import { sendRequest, forEach } from 'substance'

export default class HttpStorageClient {
  constructor(apiUrl, defaultHeaders) {
    this.apiUrl = apiUrl
    this.headers = defaultHeaders;
  }

  /*
    @returns a Promise for a raw archive, i.e. the data for a DocumentArchive.
  */
  read(archiveId, cb) {
    let url = this.apiUrl
    let header = this.headers
    if (archiveId) {
      url = url + '/' + archiveId
    }
    return sendRequest({
      method: 'GET',
      url,
      header
    }).then(response => {
      cb(null, JSON.parse(response))
    }).catch(err => {
      cb(err)
    })
  }

  write(archiveId, data, cb) {
    let form = new FormData()
    forEach(data.resources, (record, filePath) => {
      if (record.encoding === 'blob') {
        // removing the blob from the record and submitting it as extra part
        form.append(record.id, record.data, filePath)
        delete record.data
      }
    })
    form.append('_archive', JSON.stringify(data))
    let url = this.apiUrl
    let header = this.headers
    if (archiveId) {
      url = url + '/' + archiveId
    }
    return sendRequest({
      method: 'PUT',
      url,
      header,
      data: form
    }).then(response => {
      cb(null, response)
    }).catch(err => {
      cb(err)
    })
  }
}
