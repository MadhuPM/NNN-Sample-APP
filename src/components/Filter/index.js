import React, {Component} from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import VirtualizedSelect from './VirtualizedSelect'
import Icon,{ICONS} from '../../components/Icon'
export default class Filter extends Component {
    static defaultProps = {
        searchable: true
    }
    static propTypes = {
        options:PropTypes.array,
        searchable: PropTypes.bool,
        onChange:PropTypes.func,
        defaultValue: PropTypes.any,
        value: PropTypes.any,
        className:PropTypes.any,
        clearable:PropTypes.any
    }
    constructor(props) {
        super(props)
        this.state={
            selectValue: props.defaultValue
        }
    }
    arrowRenderer=(info)=>{
        return <Icon name={ICONS.ARROW_DOWN} size="10" thickness="3" color="#2f749a"/>
    }
    onSelect=(selectValue)=>{
        this.props.value || this.setState({ selectValue })
        if(this.props.onChange){
            this.props.onChange(selectValue)
        }
    }
    render() {
        let {options,defaultValue,value,onChange,className,clearable,searchable, ...props} = this.props
        let classname = classNames('design2-filterBy', className)
        return (<VirtualizedSelect 
            placeholder='Filter By'
            options={options}
            clearable={false}
            onChange={this.onSelect}
            value={value?value:this.state.selectValue}
            arrowRenderer={this.arrowRenderer}
            className={classname}
            searchable={searchable}
            {...props}
                />)
    }
}
