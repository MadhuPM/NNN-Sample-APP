import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {injectIntl} from 'react-intl'
import DatePickerBase from './DatePicker'
import RangePickerBase from './RangeDatePicker'
import moment from 'moment'
import en from './locale/en'

function getLocale(){
  let lang
  if (navigator.languages && navigator.languages.length) {
    lang = navigator.languages[0]
  } else if (navigator.userLanguage) {
    lang = navigator.userLanguage
  } else {
    lang = navigator.language
  }
  return lang
}

function getMoment(value, stringFormat='M/D/YYYY'){
  if (value === undefined) {
    return undefined
  }
  let momentValue = value    
  if ( value && value.format === undefined) {
    momentValue = moment(value)
  }
  else{
    if (typeof value === 'string') {
      momentValue = moment(value, stringFormat)
    }
  }
  return momentValue
}

@injectIntl
class DatePicker extends Component {  
  static propTypes = {
    intl: PropTypes.object,
    value: PropTypes.any,
    defaultValue: PropTypes.any,
    stringFormat: PropTypes.string,
    format: PropTypes.string
  }

  constructor(props, context) {
    super(props, context)
    let intl = props.intl
    let localeStr = intl && intl.locale || this.getLocale()
    try {  
      this.locale = require(`./locale/${localeStr}`)
    } catch (err) {
      this.locale = require(`ssc-cdt4/lib/components/DatePicker/locale/${localeStr}`)
    }
    this.format = this.locale && this.locale.dateFormat || en.dateFormat
  }  

  render() {
    const {value, defaultValue, stringFormat, format, ...otherProps} = this.props
    let momentValue = getMoment(value, stringFormat)
    if (momentValue !== undefined) {
      return (
        <DatePickerBase
          locale={this.locale}
          {...otherProps}
          format={format || this.format}
          value={momentValue}
        />
      )
    }
    let momentDefaultValue = getMoment(defaultValue, stringFormat)
    if (momentDefaultValue !== undefined) {
      return (
        <DatePickerBase
          locale={this.locale}
          {...otherProps}
          format={format || this.format}
          defaultValue={momentDefaultValue}
        />
      )
    }
    return (
      <DatePickerBase
        locale={this.locale}
        {...otherProps}
        format={format || this.format}
      />
    )
  }
}
@injectIntl
class RangePicker extends Component {  
  static propTypes = {
    intl: PropTypes.object,
    format: PropTypes.string
  }

  constructor(props, context) {
    super(props, context)
    let intl = props.intl
    let localeStr = intl && intl.locale || this.getLocale()
    this.locale = require(`./locale/${localeStr}`)
    this.format = this.props.format || this.locale && this.locale.dateFormat
  }
  
  render() {
    const {format, ...otherProps} = this.props
    return (
      <RangePickerBase
      locale={this.locale}
      {...otherProps}
      format={format ||this.format}
      />
    )
  }
}

export {DatePicker, RangePicker}