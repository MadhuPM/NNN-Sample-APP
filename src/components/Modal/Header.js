import React, { Component } from "react"
import PropTypes from 'prop-types'
import { ModalHeader as RawModalHeader } from "react-bootstrap"

export default class ModalHeader extends Component {
    static defaultProps = {
        closeButton: true
    }
    static propTypes = {
        closeButton: PropTypes.bool,
        children: PropTypes.any
    }
    constructor(props) {
        super(props)
    }
    render() {

        let { children,closeButton,...props } = this.props

        return (
            <RawModalHeader closeButton={closeButton} {...props} >
                {children}
            </RawModalHeader>
        )

    }

}
