import React, { Component } from "react"
import PropTypes from 'prop-types'
import { Tooltip as RawTooltip} from 'react-bootstrap'

export default class Tooltip extends Component {
    static defaultProps = {
        placement: "right"
    }
    static propTypes = {
        arrowOffsetLeft: PropTypes.string,
        arrowOffsetTop: PropTypes.string,
        bsClass: PropTypes.string,
        id: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.number
        ]),
        placement:PropTypes.oneOf(["top","right","left","bottom"]),
        positionLeft: PropTypes.oneOfType([
            PropTypes.number,
            PropTypes.string
        ]),
        positionTop:  PropTypes.oneOfType([
            PropTypes.number,
            PropTypes.string
        ]),
        children: PropTypes.any
    }
    constructor(props) {
        super(props)
        let id='Tooltip-'+(props.id?props.id:Math.random().toString(36).substr(2))
        this.state = {
            id
        }
    }

    render() {
        let {children, ...props } = this.props
        
        return (
            <RawTooltip id={this.state.id} bsClass="design2-toolTip" {...props} >{children}</RawTooltip>
        )
        
    }

}
