import React, { Component } from "react"
import PropTypes from 'prop-types'
import { Overlay as RawOverlay} from 'react-bootstrap'

export default class Overlay extends Component {
    static defaultProps = {
        
    }
    static propTypes = {
        show: PropTypes.bool,
        target: PropTypes.oneOfType([
            PropTypes.element,
            PropTypes.func
        ]),
        placement: PropTypes.oneOf(["top","right","left","bottom"]),
        onEnter: PropTypes.func,
        onEntered: PropTypes.func,
        onEntering: PropTypes.func,
        onExit: PropTypes.func,
        onExited: PropTypes.func,
        onExiting: PropTypes.func,
        rootClose: PropTypes.bool,
        onHide: PropTypes.func,
        children: PropTypes.any
    }
    constructor(props) {
        super(props)
    }

    render() {
        let {children, ...props } = this.props

        return (
            <RawOverlay {...props} >{children}</RawOverlay>
        )
    }

}
