import React, { Component } from "react"
import { Col as RawCol} from 'react-bootstrap'
import PropTypes from 'prop-types'

export default class Col extends Component {
    static propTypes = {
        children: PropTypes.any
    }
    render() {
        return (
            <RawCol {...this.props} >{this.props.children}</RawCol>
        )
        
    }

}
