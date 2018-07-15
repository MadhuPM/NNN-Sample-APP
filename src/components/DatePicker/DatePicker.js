import React from "react"
import PropTypes from "prop-types"
import { findDOMNode } from "react-dom"
import createChainedFunction from "rc-util/lib/createChainedFunction"
import Icon, { ICONS } from "../Icon"
import Button from "../Button"
import Overlay from "../Overlay"
import moment from "moment"
import Calendar from "./Calendar"
import enUS from "./locale/en_US"

import DebounceInput from "./DebounceInput"
import Placement from "./Placement"

const {timePicker, ...newProps} = Calendar.propTypes

export default class DatePicker extends React.Component {
  static defaultProps = {
    className: "design2-datepicker design2-input",
    rootClose: true,
    onChange:()=>{},
    placement: 'bottom'
  }

  static propTypes = {
    ...newProps,
    defaultValue: PropTypes.object,
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
    this.cachedSelectionStart = this.dateInputInstance.selectionStart;
    this.cachedSelectionEnd = this.dateInputInstance.selectionEnd;
    // when popup show, click body will call this, bug!
    let selectedValue = this.state.value
    if (this.state.controlled) {
      selectedValue = nextProps.value
    }
    this.setState({
      value: selectedValue,
      invalid: false,
      show:false
    });
  }
  componentDidUpdate() {
    if (!this.state.invalid) {
      // this.dateInputInstance.setSelectionRange(this.cachedSelectionStart, this.cachedSelectionEnd);
    }
  }
  onCalendarSelect = (value, cause = {}) => {
    const props = this.props
    const { onChange } = this.props
    if (!("value" in props)) {
      this.setState({
        value,
        invalid: false,
        show: false
      })
    }
    onChange(value)
  }

  onInputChange = (event) => {
    let str = event.target.value
    // str = str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "")
    this.setState({
      str
    })
    let value
    const { disabledDate, format, onChange } = this.props
    if (str) {
      const parsed = moment(str, format, true)
      if (!parsed.isValid()) {
        this.setState({
          invalid: true
        })
        return
      }
      value = this.state.value ? this.state.value.clone() : moment()
      value
        .year(parsed.year())
        .month(parsed.month())
        .date(parsed.date())
        .hour(parsed.hour())
        .minute(parsed.minute())
        .second(parsed.second())

      if (value && (!disabledDate || !disabledDate(value))) {
        const originalValue = this.props.selectedValue
        if (originalValue && value) {
          if (!originalValue.isSame(value)) {
            onChange(value)
          }
        } else if (originalValue !== value) {
          this.setState({
            value,
            show: false
          })
          onChange(value)
        }
      } else {
        this.setState({
          invalid: true
        })
        return
      }
    } else {
      onChange(null)
    }
    if (str === "") {
      this.setState({
        invalid: false,
        value: undefined
      })
    }
    this.setState({
      invalid: false
    })
  }
  saveDateInput=(dateInput)=> {
    this.dateInputInstance = dateInput;
  }

  show = () => {
    return this.setState({ show: true })
  }
  
  onEnter=(e)=>{
    const {left,top}=this.refs.target.getBoundingClientRect()    
    var w = window,
        d = document,
        e = d.documentElement,
        g = d.getElementsByTagName('body')[0],
        x = w.innerWidth || e.clientWidth || g.clientWidth,
        y = w.innerHeight|| e.clientHeight|| g.clientHeight;
    if( y > top + 354){
      // console.log('render bottom')
      this.setState({
        p:'calendar-placement',
        placement: 'bottom'
      })
    }
    else{
      // console.log('render top')
      this.setState({
        p:'calendar-placement-top',
        placement: 'top'
      })
    }
  }
  
  onExited=(e)=>{
    // set input width
    this.setState({
      p: undefined,
      placement: undefined
    })
  }

  getState = (props) => {
    const {value, defaultValue, controlled} = props
    let val = value?value:defaultValue
    let controlled_ = (controlled || value)?true:false
    return {
      controlled:controlled_,
      value: val
    }
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
      container,
      disabledDate,
      ...props
    } = this.props
    const locale_ = locale || enUS    
    const format_ = format || locale_.dateFormat
    const {value, p, placement} = this.state
    // let p = placement==='top'?'calendar-placement-top':'calendar-placement'
    const calendar = (
      <Calendar
        onSelect={this.props.onSelect}
        defaultValue={value}
        selectedValue={value}
        locale={locale_}
        // disabledDate={disabledDate}
      />
    )
    const extraProps = {
      onSelect: createChainedFunction(calendar.onSelect, this.onCalendarSelect)
    }
    const invalid = this.state.invalid
    const invalidStr = !invalid || this.state.str
    const valueStr = invalid
      ? invalidStr
      : (value && value.format(format_)) || ""
    const inputClass = invalid ? `${className} invalid` : `${className}`
    let position, offsetX = 0
    if(typeof container === 'string') {
      if(container === 'modal'){
        position = this
        offsetX = -140
      }
      else{
        position = document.body
      }
    }
    else {
      position = container
    }
    return (
      <div className={"datepicker-base"}>
        <span ref='target'  style={{position:'absolute',height:'40px',left:0}}/>
        <span className={"datepicker-base-input"}>
          <DebounceInput
            debounceTimeout={100}
            placeholder={placeholder||format_}
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
          container={position}
          rootClose={rootClose}
          target={props => findDOMNode(this.refs.target)}
          onEnter={this.onEnter}
          onExited={this.onExited}
        >
          <Placement 
            p={p}
            offsetX={offsetX}
          >
          {React.cloneElement(calendar, extraProps)}
          </Placement>
        </Overlay>
      </div>
    )
  }
}
