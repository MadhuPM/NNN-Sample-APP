import React, { Component } from "react"
import PropTypes from 'prop-types'
import classnames from 'classnames'
import { Button as Btn } from "react-bootstrap"
import Icon, { ICONS } from '../Icon'

export default class Button extends Component {
  static defaultProps = {

  }
  static propTypes = {
    bsSize: PropTypes.string,
    bsStyle: PropTypes.oneOf(["default", "primary"]),
    componentClass: PropTypes.string,
    disabled: PropTypes.bool,
    href: PropTypes.string,
    onClick: PropTypes.func,
    type: PropTypes.string,
    children: PropTypes.any
  }
  constructor(props) {
    super(props)
  }

  render() {

    let { children, ...props } = this.props
    
    return (
        <Btn bsClass="design2-button" {...props} >{children}</Btn>
    )

  }

}
