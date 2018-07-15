import React, { Component } from "react"
import PropTypes from 'prop-types'
import classnames from 'classnames'
import { findDOMNode } from 'react-dom'

export default class Card extends Component {
  static defaultProps = {
    footerText: "Full View >",
    showFooter: true,
    showHeader: true,
    onMenu:()=>{}
  }
  static propTypes = {
    name: PropTypes.string.isRequired,
    className: PropTypes.any,
    children: PropTypes.any,
    onFooterClick: PropTypes.func,
    footerText: PropTypes.string,
    showFooter:PropTypes.bool,
    width:PropTypes.number,
    height:PropTypes.number,
    onMenu:PropTypes.func,
    CardMenu:PropTypes.any,
    index:PropTypes.any,
    isDraggable:PropTypes.any,
    onResize:PropTypes.any,
    showHeader:PropTypes.any
  }
  constructor(props) {
    super(props)    
    this.onFooterClick = this.onFooterClick.bind(this)
    this.onMenu = this.onMenu.bind(this)
  }

  onFooterClick(e) {
    if (this.props.onFooterClick) {
			this.props.onFooterClick(e)
		}
  }

  onMenu(key) {
    if (this.props.onMenu) {
			this.props.onMenu(key)
		}
  }
  
  render() {
    let { className, children, onFooterClick,
      width, height, isDraggable,
      onMenu, name, index, footerText, onResize, 
      CardMenu, showFooter, showHeader, ...props } = this.props
        
    let prioritization = classnames('card-body', className)
    let layoutClass = width?"card-layout-size":"card-layout"
    let style = {width:width,height:height}
    let dragClass =  isDraggable || typeof isDraggable === 'undefined' ? 'card-header react-grid-dragHandle':"card-header"
    return (
     <div {...props} className={layoutClass} style={style}>
        {showHeader
          ?<div className={dragClass}>
              <span>{name}</span>
            </div>
          :null
        }
        <div className={prioritization}>
          {CardMenu
            ?<CardMenu onClick={onMenu} index={index} className="card-menu"/>
            :null
          }
          {children}
          {showFooter
            ?<div className={"card-footer"}>
              <span onClick={this.onFooterClick}>{footerText}</span>
            </div>
            :null
          }
        </div>        
      </div>
    )
  }
}
