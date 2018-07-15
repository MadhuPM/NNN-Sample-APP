import React, {Component} from "react"
import PropTypes from 'prop-types'
import {Tab as RawTab} from 'react-bootstrap'

export default class Tab extends Component{
	static propTypes = {
    bsClass: PropTypes.string,
    animation: PropTypes.bool,
    disabled: PropTypes.bool,
    eventKey: PropTypes.any,
    children:PropTypes.any
	}
	constructor(props) {
      super(props)
  }
  
	render() {
        let {children, ...props} = this.props
      return(
        <RawTab {...props} >{children}</RawTab>
        )
    }
	
}
