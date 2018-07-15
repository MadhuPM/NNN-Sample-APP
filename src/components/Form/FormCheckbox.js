import React, {Component} from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
export default class Checkbox extends Component {
    static propTypes = {
        children: PropTypes.any,
        onChange:PropTypes.func,
        value: PropTypes.bool,
        name:PropTypes.any,
        label:PropTypes.string,
        disabled:PropTypes.bool,
        className:PropTypes.any
    }
    static defaultProps ={ 
        value:false
    }
    onChange = (e) => {
        if (!this.props.disabled) {
            this.props.onChange(e.target.checked)
        }
    }
    render() {
        let {value,name,label,disabled,className, ...props} = this.props
        value=value?true:false
        let classname=classNames('design2-checkbox',className,{'checked':value,'disabled':disabled})
        return (
        <label className={classname}>{label}<input type="checkbox" name={name}  checked={value} onChange={this.onChange}/></label>)
    }
}
