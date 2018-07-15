import React, {Component} from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
export default class Checkbox extends Component {
    static propTypes = {
        children: PropTypes.any,
        onChange: PropTypes.func,
        name: PropTypes.any,
        label: PropTypes.string,
        disabled: PropTypes.bool,
        className: PropTypes.any,
        checked: PropTypes.bool,
        onClick: PropTypes.func,
        value: PropTypes.any,
        inline: PropTypes.bool,
        size: PropTypes.string
    }
    constructor(props) {
        super(props)
        this.state = {
            checked: (props.checked)
        }
    }
    componentWillReceiveProps(nextProps) {
        this.setState({checked: nextProps.checked})
    }
    onChange = (e) => {
        const {onChange} = this.props
        this.setState({checked: e.target.checked})
        onChange
            ? onChange(e)
            : null
    }
    onClick = (e) => {
        const {onClick} = this.props
        onClick
            ? onClick(e)
            : null
    }
    render() {
        let {
            name,
            label,
            disabled,
            className,
            value,
            inline,
            size,
            ...props
        } = this.props
        let {checked, id} = this.state
        let classname = classNames('design2-checkbox', className, {
            'checked': checked,
            'disabled': disabled,
            'inline': inline,
            'small-checkbox': size == 'small'
        })
        return (
            <label className={classname}>{label}
                <input
                    type="checkbox"
                    name={name}
                    checked={checked}
                    onChange={this.onChange}
                    disabled={disabled}
                    onClick={this.onClick}
                    value={value}
                /></label>
        )
    }
}
