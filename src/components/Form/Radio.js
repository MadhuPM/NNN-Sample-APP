import React, {Component} from 'react'
import PropTypes from 'prop-types'
import Icon, {ICONS} from '../../components/Icon'
import classNames from 'classnames'
export default class Radio extends Component {
    static propTypes = {
        children: PropTypes.any,
        options: PropTypes.array,
        onChange: PropTypes.func,
        value: PropTypes.string,
        name: PropTypes.any,
        label: PropTypes.string,
        inline: PropTypes.bool,
        className: PropTypes.any,
        inner: PropTypes.bool
    }
    constructor(props) {
        super(props)
        this.state = {
            value: props.value
        }
    }
    onChange = (e) => {
        const {onChange, inner} = this.props
        onChange
            ? (inner
                ? onChange(e.target.value)
                : onChange(e))
            : null
    }
    render() {
        let {options,value,name,label,inline,className,...props} = this.props
        let optionsList = options.map((item, index) => {
            let classname = classNames('design2-radio', {
                'checked': value === item.value,
                'disabled': item.disabled,
                'inline': inline
            })
            return (<label className={classname} key={index}>{item.label}
                <input
                type="radio"
                name={name}
                value={item.value}
                checked={value === item.value}
                onChange={!item.disabled
                ? this.onChange
                : null}
                />
            </label>)
        })
        return (
            <div className="design2-radio-group">{optionsList}</div>
        )
    }
}
