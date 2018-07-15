import React from "react"
import PropTypes from "prop-types"
import { findDOMNode } from "react-dom"
import createChainedFunction from "rc-util/lib/createChainedFunction"
import Icon, { ICONS } from "../Icon"
import Button from "../Button"
import Overlay from "../Overlay"
import moment from "moment"
import RangeCalendar from "./RangeCalendar"
import enUS from "./locale/en_US"

import DebounceInput from "./DebounceInput"
import Placement from "./Placement"

const {timePicker, ...newProps} = RangeCalendar.propTypes

export default class RangeDatePicker extends React.Component {
  static defaultProps = {
    className: "design2-rangepicker design2-input",
    rootClose: true,
    onChange:()=>{},
    format:'M/D/YYYY',
    placement: 'bottom'
  }

  static propTypes = {
    ...newProps,
    onChange: PropTypes.func.isRequired,
    placement: PropTypes.oneOf(['top','bottom'])
  }

  constructor(props) {
    super(props)

    let addState=this.getState(props)
    this.state = {
      disabled: this.props.disabled,
      controlled:false,
      show: false,
      ...addState
    }
  }
  
  componentWillReceiveProps(nextProps) {
    this.cachedSelectionStart = this.dateInputInstance.selectionStart
    this.cachedSelectionEnd = this.dateInputInstance.selectionEnd
    // when popup show, click body will call this, bug!
    let selectedValue = nextProps.value || this.state.value
    if(this.state.controlled && !Array.isArray(nextProps.value)){
      selectedValue = []
    }
    this.setState({
      value: selectedValue,
      // selectedValue: value,
      invalid: false,
      show:false
    })
  }
  componentDidUpdate() {
    if (!this.state.invalid) {
      // this.dateInputInstance.setSelectionRange(this.cachedSelectionStart, this.cachedSelectionEnd)
    }
  }
  onCalendarSelect = (value, cause = {}) => {
    const props = this.props
    const { onChange, controlled } = this.props
    // if (controlled) {
      this.setState({
        selectedValue:value,
        invalid: false
      })
    // }
  }
  onClearRange =()=>{
    const { onChange } = this.props
    // this.setState({ lastSelectedRange:[] })
    this.setState({
      value: [],
      selectedValue:[],
      invalid: false
    })
    onChange([])
  }

  onInputChange = (event) =>{
    let str = event.target.value
    this.setState({
      str: str
    })
    let value = void 0
    let _props = this.props,
      disabledDate = _props.disabledDate,
      format = _props.format,
      onChange = _props.onChange

    let changed = false
    let startValue, endValue, arrayType
    if (str) {
      let start = this.getStartValue(str)
      let end = this.getEndValue(str)
      // if (end !== undefined) {
        
      // }
      let parsedStart = moment(start, format, true)
      let parsedEnd = moment(end, format, true)
      if (!parsedStart.isValid() || !parsedEnd.isValid()) {
        this.setState({
          invalid: true
        })
        return
      }
      value =  moment()
      value
        .year(parsedStart.year())
        .month(parsedStart.month())
        .date(parsedStart.date())
        .hour(parsedStart.hour())
        .minute(parsedStart.minute())
        .second(parsedStart.second())        
      startValue = value.clone()
      if (value && (!disabledDate || !disabledDate(value))) {
        arrayType =  typeof this.props.selectedValue
        let originalValue = arrayType ==='array' ?this.props.selectedValue[0]:undefined
        if (originalValue && value) {
          if (!originalValue.isSame(value)) {
            changed = true
          }
        } else if (originalValue !== value) {            
          changed = true
        }
      } else {
        this.setState({
          invalid: true
        })
        return
      }
      value
        .year(parsedEnd.year())
        .month(parsedEnd.month())
        .date(parsedEnd.date())
        .hour(parsedEnd.hour())
        .minute(parsedEnd.minute())
        .second(parsedEnd.second())
      endValue = value.clone()
      if (value && (!disabledDate || !disabledDate(value))) {  
        let originalValue = arrayType ==='array'?this.props.selectedValue[1]:undefined
        if (originalValue && value) {
          if (!originalValue.isSame(value)) {
            changed = true
          }
        } else if (originalValue !== value) {
          changed = true
        }
      } else {
        this.setState({
          invalid: true
        })
        return
      }
    } else {
      onChange([])
    }
    if (changed) {      
      this.setState({
        value: [startValue, endValue],
        selectedValue:[startValue, endValue],
        invalid: false,
        show: false
      })
      onChange([startValue, endValue])
    }
    this.setState({
      invalid: false
    })
  }

  saveDateInput=(dateInput)=> {
    this.dateInputInstance = dateInput
  }

  show = () => {
    let show = this.state.show
    this.setState({ show: !show })
  }

  onOk = (selectedValue) => {    
    const { onChange } = this.props
    this.setState({ 
      show: false,
      value: selectedValue
    })
    onChange(selectedValue)    
  }

  getState = (props) => {
    const {value,defaultValue} = props
    let val = value?value:defaultValue
    let controlled = value?true:false
    if(!Array.isArray(val)){
      return {
        controlled,
        selectedValue:[],
        value: []
      }
    }
    return {
      controlled,
      selectedValue:val,
      value: val
    }
  }

  renderFooter() {
    const {locale, prefixCls} = this
    const locale_ = locale || enUS
    const style = {
      position: 'absolute',
      right: '124px',
      top: '14px',
      width: '91px'
    }
    return (
        <div>
          <span className={'range-calendar-clear'} onClick={this.onClearRange}>{locale_.clear||'Clear'}</span>
          <Button 
            style={style} 
            onClick={this.onCancelRange}
          >
          {locale_.cancel ||'Cancel'}
          </Button>
        </div>
    )
  }
  getStartValue=(value)=> {
    let start = value.split("-")[0]
    return start.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "")
  }
  getEndValue=(value)=> {
    let end = value.split("-")[1]
    return end && end.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "")
  }
  render() {
    const {
      disabled,
      onChange,
      onCalendarSelect,
      format,
      locale,
      placeholder,
      width,
      className,
      rootClose,
      placement,
      ...props
    } = this.props
    const locale_ = locale || enUS    
    const format_ = format||locale_.dateFormat
    const placeholder_ =placeholder || []
    const value = this.state.value
    let p = placement==='top'?'calendar-placement-top':'calendar-placement'
    const calendar = (
      <RangeCalendar
        onSelect={this.props.onSelect}
        defaultValue={value}
        selectedValue={this.state.selectedValue|| []}
        onOk={this.onOk}
        renderFooter={this.renderFooter}
        locale={locale_}
        format={format_}
        showOk
        onClearRange={this.onClearRange}
        onCancelRange={this.show}
      />
    )
    const extraProps = {
      onSelect: createChainedFunction(calendar.onSelect, this.onCalendarSelect)
    }
    const invalid = this.state.invalid
    const invalidStr = !invalid || this.state.str
    let start = value && value[0]
    let end = value && value[1]
    const valueStr = invalid
      ? invalidStr
      : (start &&
          `${start.format(this.props.format)} - ${end.format(
            this.props.format
          )}`) ||
        ""
    const inputClass = invalid ? `${className} invalid` : `${className}`
    return (
      <div className={"datepicker-base"}>
        <span ref='target'  style={{position:'absolute',height:'40px',left:0}}/>
        <span className={"datepicker-base-input"}>
          <DebounceInput
            debounceTimeout={100}
            placeholder={`${placeholder_[0]||format} - ${placeholder_[1]||format}`}
            disabled={disabled}
            className={inputClass}
            onClick={this.show}
            onChange={this.onInputChange}
            value={valueStr}
            width={width}
            ref={this.saveDateInput}
            autoComplete="off"
          />
          <span className={`design2-input-icon-right ${disabled}`}>
            <Icon name={ICONS.CALENDAR} size="20" onClick={this.show}/>
          </span>
        </span>
        <Overlay
          show={this.state.show}
          onHide={() => this.setState({ show: false })}
          placement={placement}
          container={document.body}
          rootClose={rootClose}
          target={props => findDOMNode(this.refs.target)}
        >
          <Placement 
            p={p}
            offsetX={140}
          >
          {React.cloneElement(calendar, extraProps)}
          </Placement>
        </Overlay>
      </div>
    )
  }
}

