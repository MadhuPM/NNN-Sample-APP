import React, {Component} from 'react'
import PropTypes from 'prop-types'
import VirtualizedSelect from '../Filter/VirtualizedSelect'
import Icon,{ICONS} from '../../components/Icon'
import classNames from 'classnames'
export default class Select extends Component {
    static propTypes = {
        children: PropTypes.any,
        options:PropTypes.array,
        onChange:PropTypes.func,
        value: PropTypes.any,
        multiple:PropTypes.bool,
        inner:PropTypes.bool,
        className:PropTypes.any,
        clearable:PropTypes.bool
    }
    constructor(props) {
        super(props)

        this.state = {
            isOpen:false
        }
    }
    onChange = (e) => {
        const {onChange,inner}=this.props
        onChange?(inner?onChange(e.value):onChange(e)):null
    }
    arrowRenderer=(info)=>{
        if (this.state.isOpen) {
            return <Icon name={ICONS.ARROW_UP} color="#464646"/>
        }
        return <Icon name={ICONS.ARROW_DOWN} color="#464646"/>

    }
    open=()=>{
        this.setState({isOpen:true})
    }
    close=()=>{
        this.setState({isOpen:false})
    }
    render() {
        let {options,value,onChange,className,clearable, ...props} = this.props
        let classname = classNames('design2-select', className)
        return (
            <VirtualizedSelect 
                options={options}
                clearable={clearable?clearable:false}
                onChange={this.onChange}
                value={value}
                onOpen={this.open}
                onClose={this.close}
                arrowRenderer={this.arrowRenderer}
                className={classname}
                {...props}
            />
        )
    }
}
