import { Component } from 'substance'

export default class FormLabel extends Component {

  render($$) {
    let el = $$('div').addClass('sc-form-label')
    el.append(
      this._getLabel(this.props.name)
    )
    return el
  }

  _getLabel(name) {
    let labelProvider = this.context.labelProvider
    return labelProvider.getLabel(name)
  }

}
