import React, {Component} from 'react'
import PropTypes from 'prop-types'
import VirtualizedSelect from '../Filter/VirtualizedSelect'
import Icon, {ICONS} from '../../components/Icon'
import classNames from 'classnames'
export default class Sorting extends Component {
    static propTypes = {
        options: PropTypes.array,
        onChange: PropTypes.func,
        value: PropTypes.any,
        className: PropTypes.any
    }
    constructor(props) {
        super(props)
        this.state = {
            selectValue: null
        }
    }
    arrowRenderer = (info) => {
        return <Icon name={ICONS.ARROW_DOWN} size="10" thickness="3" color="#2f749a"/>
    }
    onSelect = (selectValue) => {
        this.setState({selectValue:(selectValue!==[]?selectValue:null)})
        if (this.props.onChange) {
            this.props.onChange(selectValue)
        }
    }
    onChange = (e) => {
        let {options}=this.props
        let value =options.filter((option)=>(e.target.value==option.value))[0]
        let checked=e.target.checked
        this.setState({selectValue:checked?e.target.value:null})
        if (this.props.onChange) {
            this.props.onChange(checked?value:null)
        }
    }
    render() {
        let {
            options, value,onChange,className,...props
        } = this.props
        let {selectValue} = this.state
        let showDropdown = options.length > 3
            ? true
            : false
        let optionsList = options.map((item, index) => {
            let classname = classNames('design2-sorting-option', {
                'checked': selectValue === item.value
            })
            return (
                <label className={classname} key={index}>{item.label}
                    <input
                        type="checkbox"
                        name={name}
                        value={item.value}
                        checked={selectValue === item.value}
                        onChange={this.onChange}
                    />
                </label>
            )
        })
        let content = showDropdown
            ? <VirtualizedSelect
                    placeholder='Sort by'
                    options={options}
                    clearable
                    onChange={this.onSelect}
                    value={this.state.selectValue}
                    arrowRenderer={this.arrowRenderer}
                    searchable={false}
                    className='design2-filterBy'
                    {...props}
              />
            : <div className="sorting-body">Sort by:{optionsList}</div>
        return (
            <div className="design2-sorting">
                {content}
            </div>
        )
    }
}
