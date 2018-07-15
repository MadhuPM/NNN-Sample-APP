import React, { Component } from "react"
import PropTypes from 'prop-types'
import classnames from 'classnames'
import moment from 'moment'
import Tooltip from '../Tooltip'
import Icon, { ICONS } from '../Icon'
import Menu, { SubMenu, MenuItem } from '../Menu'

export default class ListItem extends Component {
  static defaultProps = {

  }
  static propTypes = {
    msg: PropTypes.object,
    type: PropTypes.any,
    charLimit: PropTypes.number,
    keyField: PropTypes.string,
    onMarkAsRead: PropTypes.func,
    overflowMenu: PropTypes.func,
    onTitleClick: PropTypes.func
  }
  constructor(props) {
    super(props)
    this.state = {
      show: false,
      showText: false
    }
  }
  onMarkAsRead = (e) => {
    e.stopPropagation()
    const { onMarkAsRead,msg,keyField } = this.props
    this.setState({
      show: false
    })
    onMarkAsRead ? onMarkAsRead(msg[keyField]) : null
  }
  onHoverOval = (e) => {
    const { msg } = this.props
    e.stopPropagation()
    !msg.isRead && this.setState({
      show: true
    })
  }
  onOutOval = (e) => {
    const { msg } = this.props
    e.stopPropagation()
    !msg.isRead && this.setState({
      show: false
    })
  }
  timeFormat = (t) => {
    const n = new Date().getTime() - t
    if (n < 24 * 60 * 60 * 1000) {
      return moment(t).fromNow()
    } else {
      return moment(t).format("MMM DD [at] h:mma")
    }
  }
  onTitleClick = () => {
    const { onTitleClick, keyField, msg } = this.props
    onTitleClick ? onTitleClick(msg[keyField]) : null
  }
  onClickOverflow = (e) => {
    e.stopPropagation()
  }
  onHoverLi = () => {
    const {charLimit, msg}= this.props
    charLimit && msg.title.length>charLimit && this.setState({
      showText: true
    })
  }
  onOutLi = () => {
    const {charLimit, msg}= this.props
    msg.title.length>charLimit && this.setState({
      showText: false
    })
  }
  render() {
    let {  show, showText } = this.state
    const {msg,keyField, type,overflowMenu } = this.props

    return (
      <li className={classnames("listItem", { "listItem-notRead": !msg.isRead })} onClick={this.onTitleClick} onMouseOver={this.onHoverLi} onMouseOut={this.onOutLi}>
        <span className="listItem-radio" onClick={this.onMarkAsRead} onMouseOver={this.onHoverOval} onMouseOut={this.onOutOval} />
        <span className="listItem-text">
          {msg.title.charAt(0).toUpperCase()+msg.title.slice(1)}
          <br />
          {this.timeFormat(msg.time)}
        </span>

        {overflowMenu?<Menu test className='listItem-overflow' onTitleClick={this.onClickOverflow} width={253} offsetX={-110} dropdownClassName='listItem-dropdown'>
          {overflowMenu(type,msg[keyField])}
        </Menu>:null}

        <Tooltip id="tooltip-isRead" arrowOffsetLeft='15px' placement='top' className={classnames('tooltip-isRead', { 'hide': !show })}>
          Mark as read
        </Tooltip>

        <Tooltip id="tooltip-text" placement='top' className={classnames('tooltip-text', { 'hide-text': !showText })}>
          {msg.title}
        </Tooltip>
      </li>
    )

  }

}
