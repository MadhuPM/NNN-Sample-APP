import React, {Component} from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import Icon,{ICONS} from '../../components/Icon'
import Checkbox from './Checkbox'

export default class CheckboxGroup extends Component {
    static propTypes = {
        children: PropTypes.any,
        options:PropTypes.array,
        onChange:PropTypes.func,
        value: PropTypes.array,
        name:PropTypes.any,
        inline:PropTypes.bool
    }
    constructor(props) {
        super(props)
        this.state = {
            value:props.value
        }
    }
    componentWillReceiveProps(nextProps) {
        const props = {}
        if ('value' in nextProps) {
          props.value = nextProps.value || []
        }
        this.setState(props)
    }
    onChange = (e) => {
        let value=this.state.value.concat([])
        if (e.target.checked) {
            value.push(e.target.value)
            this.props.onChange(value)
        }else{
            this.props.onChange(value.filter(item=>e.target.value.indexOf(item)==-1))
        }
    }
    render() {
        let {options,name,inline,...props} = this.props
        let {value}=this.state
        let optionsList=options.map((item,index)=>{
            return (<Checkbox onChange={this.onChange} key={index}
            label={item.label} disabled={item.disabled} checked={value.indexOf(item.value)!==-1}
            value={item.value} inline={inline}
                    />)      
        })
        return (
            <div className="design2-checkbox-group">{optionsList}</div>         
             )
    }
}
