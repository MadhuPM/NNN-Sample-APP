import React, { Component } from "react"
import { Clearfix as RawClearfix} from 'react-bootstrap'
import PropTypes from 'prop-types'
export default class Col extends Component {
    static propTypes = {
        children: PropTypes.any
    }
    render() {
        return (
            <RawClearfix {...this.props} >{this.props.children}</RawClearfix>
        )
        
    }

}
