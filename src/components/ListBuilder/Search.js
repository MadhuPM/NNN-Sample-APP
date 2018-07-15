import React, {Component} from "react"
import PropTypes from 'prop-types'
import Icon,{ICONS} from '../Icon'
export default class Search extends Component {
  static propTypes = {
    value: PropTypes.any,
    onChange:PropTypes.func,
    left: PropTypes.bool,
    onClose:PropTypes.func
  }

  render() {
    let {value,onChange,left,onClose} = this.props
    return (
      <div className="list-search">
      <Icon name={ICONS.SEARCH} size="20"/><input value={value} onChange={onChange} autoFocus /><span className="close-button" onClick={onClose}></span>
      </div>
    )
  }
}
