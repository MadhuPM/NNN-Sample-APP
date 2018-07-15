import React, { Component } from "react"
import PropTypes from 'prop-types'
import { ModalTitle as RawModalTitle } from "react-bootstrap"

export default class ModalTitle extends Component {
    static defaultProps = {
        componentClass: 'span'
    }
    static propTypes = {
        componentClass: PropTypes.string,
        children: PropTypes.any
    }
    constructor(props) {
        super(props)
    }
    render() {

        let { componentClass,children,...props } = this.props

        return (
            <RawModalTitle componentClass={componentClass} {...props} >
                {children}
            </RawModalTitle>
        )

    }

}
