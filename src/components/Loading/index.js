import React, { Component} from "react"
import PropTypes from 'prop-types'
import Icon,{ICONS} from '../Icon'

import classNames from 'classnames'

export default class Loading extends Component {    
    static propTypes = {
        loaded: PropTypes.bool,
        className: PropTypes.string,
        thickness: PropTypes.string,
        color:PropTypes.string
    }

    static defaultProps = {
        loaded: false,
        color:"#2f749a",
        thickness:'1'
    }

    render() {
        const {loaded, className, color, thickness, ...props} = this.props
        if (loaded) { return null }
        const loadingClass = classNames('loading-animation', className)

        return (
            <div className={loadingClass} {...props}>
                <Icon name={ICONS.LOADING}  color={color} thickness={thickness} size={'100%'} />
            </div> 
        )
    }
}
