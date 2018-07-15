import React, { Component } from "react"
import { Row as RawRow} from 'react-bootstrap'
import PropTypes from 'prop-types'
export default class Row extends Component {
    static propTypes = {
        children: PropTypes.any
    }
    render() {
        return (
            <RawRow {...this.props} >{this.props.children}</RawRow>
        )
        
    }

}
