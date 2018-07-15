import React, { Component } from "react"
import PropTypes from 'prop-types'
import { ModalBody as RawModalBody } from "react-bootstrap"
import classnames from 'classnames'

export default class ModalBody extends Component {
    static defaultProps = {
    
    }
    static propTypes = {
        bsClass: PropTypes.string,
        children: PropTypes.any
    }
    constructor(props) {
        super(props)
    }
    render() {

        let {children,bsClass,...props } = this.props

        return (
            <RawModalBody bsClass={classnames("modal-body",bsClass)} {...props} >
                {children}
            </RawModalBody>
        )

    }

}
