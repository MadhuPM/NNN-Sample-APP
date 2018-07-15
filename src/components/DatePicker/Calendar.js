import React from "react"
import PropTypes from 'prop-types'
import Calendar from "rc-calendar/lib/Calendar"

const {timePicker, ...newProps} = Calendar.propTypes

export default class Component extends React.Component {
    static propTypes = {
        ...newProps
    }

  render() {
    const { timePicker, ...otherProps } = this.props
    return (
      <Calendar
        className={'remove-calendar-top'}
        {...otherProps}
        showDateInput={false}
        showToday={false}
        mode={"date"}
      />
    )
  }
}
