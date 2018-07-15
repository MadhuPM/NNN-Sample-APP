import React, {Component} from "react"
import PropTypes from 'prop-types'
import {Tabs as RawTabs} from 'react-bootstrap'
import classNames from 'classnames'

export default class Tabs extends Component{
	static propTypes = {
    animation: PropTypes.bool,
    activeKey: PropTypes.any,
    defaultActiveKey: PropTypes.any,
    onSelect: PropTypes.func,
    children:PropTypes.any,
    hasIcon:PropTypes.bool,
    className:PropTypes.any
    }
    static defaultProps = {
        mountOnEnter: true,
        animation: true
    }
	constructor(props) {
      super(props)
  }
	render() {
        let {children,hasIcon, ...props} = this.props
        let classname=classNames('Design2Tabs',{'has-icon-tab':hasIcon})
      return(
        <div className={classname}>
            <RawTabs {...props}  >{children}</RawTabs>
        </div>               
        
        )
    }
	
}
