import React, {Component} from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import {emptyFunc, contains} from './util'
import ReactDOM from 'react-dom'

export default class SubPopMenu extends Component {
  static propTypes = {
    children: PropTypes.any,
    positionLeft:PropTypes.number,
    positionTop:PropTypes.number,
    target:PropTypes.any,
    dropdownStateChange:PropTypes.func,
    width:PropTypes.number,
    offsetX:PropTypes.number,
    offsetY:PropTypes.number,
    className:PropTypes.string,
    adjustOffsetX:PropTypes.number,
    rightPlace:PropTypes.bool
  }
  static defaultProps = {
    offsetY:0
  }
  /**
   * @type {object}
   * 
   */
  render() {
    const {children,positionLeft,positionTop,target,offsetX,offsetY,width,className,adjustOffsetX,rightPlace,...props} = this.props
    return (
      <div className={classNames("dropdownMenuListBox",className,{'hideListBox':!rightPlace})}style={{left:offsetX||offsetX===0?(positionLeft+offsetX-adjustOffsetX+"px"):(positionLeft-(width/2)-adjustOffsetX+'px'),top:positionTop+offsetY+"px",
      width:width}} ref='box'
      > {children}</div>
    )
  }

}
