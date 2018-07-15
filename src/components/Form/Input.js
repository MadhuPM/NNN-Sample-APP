import React, {Component} from "react"
import PropTypes from 'prop-types'
import classNames from 'classnames'

export default class Input extends Component {
    static propTypes = {
        className: PropTypes.any
    }
    constructor(props) {
        super(props)
    }

    render() {
        let {
            className,
            ...props
        } = this.props
        let inputClass = classNames('design2-input', className)
        return (<input className={inputClass} {...props}/>)
    }

}
