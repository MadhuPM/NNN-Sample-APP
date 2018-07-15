import React, {Component} from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import Icon from '../Icon'

export default class MenuItem extends Component {
  static propTypes = {
    level: PropTypes.number,
    children: PropTypes.any,
    disabled: PropTypes.bool,
    divider: PropTypes.bool,
    selectedKeys:PropTypes.array,
    eventKey:PropTypes.any,
    inline:PropTypes.bool,
    once:PropTypes.bool
  }
  constructor(props) {
    super(props)
    this.state = {

    }
  }
  /**
   * Judge this menuItem  is selected
   */
  isSelected = () => {
    return this
      .props
      .selectedKeys
      .indexOf(this.props.eventKey) !== -1
  }
  /**
   * when the item was clicked, it will be select or deselect
   */
  onClick = (e) => {
    const props = this.props
    const selected = this.isSelected()
    const eventKey = props.eventKey
    const info = {
      key: eventKey,
      keyPath: [eventKey],
      item: this,
      domEvent: e
    }
    props.onClick(info)
    if (props.multiple) {
      if (selected) {
        props.onDeselect(info)
      } else {
        props.onSelect(info)
      }
    } else if (!selected) {
      props.onHide(e)
      props.onSelect(info)
    }
  }
  render() {
    const props = this.props
    const { level, children, divider, inline,disabled} = this.props
    let mouseEvent = {}
    if (!disabled) {
      mouseEvent = {
        onClick: this.onClick
      }
    }
    let className = classNames('MenuItem', {
      'lowLevel': level > 2,
      'lowerLevel':level> 3 ,
      'selectedItem': this.isSelected(),
      'disabledItem':disabled
    })
    let item = (divider)
      ? (
        <li className="dividerItem"/>
      )
      : !inline
        ? (
          <li
            className={className}
            {...mouseEvent}
          >{children}{this.isSelected()?<Icon name='check' className='selectedIcon' thickness='10'/>:null}</li>
        )
        : (
          <li
            className={className}
            style={{
            'paddingLeft': (level - 1) * 15 + 'px'
          }}
            {...mouseEvent}
          >{children}</li>
        )
    return (
      <div>{item}</div>
    )
  }

}
