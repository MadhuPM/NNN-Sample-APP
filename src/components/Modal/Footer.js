import React, { Component } from "react"
import PropTypes from 'prop-types'
import { ModalFooter as RawModalFooter } from "react-bootstrap"

export default class ModalFooter extends Component {
    static defaultProps = {
        
    }
    static propTypes = {
        children: PropTypes.any
    }
    constructor(props) {
        super(props)
    }
    render() {

        let { children, ...props } = this.props

        return (
            <RawModalFooter {...props} >
                {children}
            </RawModalFooter>
        )

    }

}
