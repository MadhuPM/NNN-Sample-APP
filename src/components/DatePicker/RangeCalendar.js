import React from "react"
import PropTypes from "prop-types"
import RangeCalendar from "rc-calendar/lib/RangeCalendar"

const { timePicker, ...newProps } = RangeCalendar.propTypes
const timePickerElement = <div />

export default class Component extends React.Component {
  static propTypes = {
    ...newProps
  }
  render() {
    const { locale, timePicker, showOk,...otherProps } = this.props
    return (
      <RangeCalendar
        className={'remove-calendar-top'}
        {...otherProps}
        showWeekNumber={false}
        showClear={false}
        showToday={false}
        showDateInput={false}
        showOk={showOk||false}
        timePicker={timePickerElement}
        mode={["date", "date"]}
      />
    )
  }
}
