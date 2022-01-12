/* global FormData */
import { sendRequest, forEach } from 'substance'
import { UpdateDraftCmd } from '@deip/command-models';
import { MultFormDataMsg } from '@deip/message-models';
import axios from 'axios'

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

    const updateDraftCmd = new UpdateDraftCmd({
      _id: archiveId,
      xmlDraft: data
    });

    const msg = new MultFormDataMsg(new FormData(), { appCmds: [updateDraftCmd] }, { 'entity-id': archiveId });

    return axios.put(
      this.apiUrl,
      msg.getHttpBody(),
      {
        headers: {
          ...this.headers,
          ...msg.getHttpHeaders()
        }
      }
    ).then(response => {
      cb(null, response)
    }).catch(err => {
      cb(err)
    })
  }
}
