import React, { Component } from 'react'
import PropTypes from 'prop-types'
const classNames = require('classnames')

export default class Toggle extends Component {
    static propTypes = {
        className: PropTypes.string,
        prefixCls: PropTypes.string,
        disabled: PropTypes.bool,
        onChange: PropTypes.func,
        checked: PropTypes.bool,
        defaultChecked: PropTypes.bool
    }

    static defaultProps = {
        prefixCls: 'design-toggle',
        className: '',
        onChange: () => { },
        defaultChecked: false
    }
    constructor(props) {
        super(props)

        let checked = false
        if ('checked' in props) {
            checked = !!props.checked
        } else {
            checked = !!props.defaultChecked
        }
        this.state = { checked }
    }

    componentWillReceiveProps(nextProps) {
        if ('checked' in nextProps) {
            this.setState({
                checked: !!nextProps.checked
            })
        }
    }

    setChecked(checked) {
        if (this.props.disabled) {
            return
        }
        if (!('checked' in this.props)) {
            this.setState({
                checked
            })
        }
        this.props.onChange(checked)
    }

    toggle = () => {
        const checked = !this.state.checked
        this.setChecked(checked)
    }

    render() {
        const { className, prefixCls, disabled, ...restProps } = this.props
        const checked = this.state.checked
        const toggleClassName = classNames({
            [className]: !!className,
            [prefixCls]: true,
            [`${prefixCls}-checked`]: checked,
            [`${prefixCls}-disabled`]: disabled
        })
        return (
            <span
                {...restProps}
                className={toggleClassName}
                onClick={this.toggle}
            >
                <span className={`${prefixCls}-inner`} />
            </span>
        )
    }
}
