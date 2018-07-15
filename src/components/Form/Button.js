import RawForm from 'react-formal'
import React, {Component} from "react"
import PropTypes from 'prop-types'
import classNames from 'classnames'
import Button from '../Button'

export default class FormButton extends Component {
    static propTypes = {
        children: PropTypes.any,
        className: PropTypes.any,
        type: PropTypes.string,
        bsStyle:PropTypes.any

    }
    static type='FormButton'
    constructor(props) {
        super(props)
    }
    render() {
        let {className,children,type,...props} = this.props
        let fieldClass = classNames('form-bottom', className)
        return (
            <RawForm.Button
                className={fieldClass}
                type={type}
                {...props}
                component={Button}
            >{children}</RawForm.Button>
        )
    }

}
