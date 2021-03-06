import { DocumentNode, CHILDREN } from 'substance'
import MetadataField from './MetadataField'

export default class Figure extends DocumentNode {
  _initialize (...args) {
    super._initialize(...args)

    this._set('state', {
      currentPanelIndex: 0
    })
  }

  get state () {
    return this.get('state')
  }

  getCurrentPanelIndex () {
    let currentPanelIndex = 0
    if (this.state) {
      currentPanelIndex = this.state.currentPanelIndex
    }
    return currentPanelIndex
  }

  getPanels () {
    return this.resolve('panels')
  }

  // NOTE: we are using structure of active panel as template for new one,
  // currently we are replicating the structure of metadata fields
  getTemplateFromCurrentPanel () {
    const currentIndex = this.getCurrentPanelIndex()
    const firstPanel = this.getPanels()[currentIndex]
    return {
      metadata: firstPanel.resolve('metadata').map(metadataField => (
        { type: MetadataField.type, name: metadataField.name, value: '' }
      ))
    }
  }

  static get refType () {
    return 'fig'
  }
}
Figure.schema = {
  type: 'figure',
  panels: CHILDREN('figure-panel')
}
