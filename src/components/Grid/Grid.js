import React, { Component } from "react"
import { Grid as RawGrid} from 'react-bootstrap'
import PropTypes from 'prop-types'
export default class Grid extends Component {
    static propTypes = {
        children: PropTypes.any
    }
    render() {
        return (
            <RawGrid {...this.props} >{this.props.children}</RawGrid>
        )
        
    }

}
