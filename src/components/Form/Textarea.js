import React, {Component} from "react"
import PropTypes from 'prop-types'
import classNames from 'classnames'

export default class Textarea extends Component {
    static propTypes = {
        className: PropTypes.any,
        children: PropTypes.any
    }
    constructor(props) {
        super(props)
    }

    render() {
        let {
            className,
            children,
            ...props
        } = this.props
        let textareaClass = classNames('design2-textarea', className)
        return (
            <textarea className={textareaClass} {...props}>{children}
            </textarea>
        )
    }

}
