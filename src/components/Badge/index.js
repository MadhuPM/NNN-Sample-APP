import React, { Component } from "react"
import PropTypes from 'prop-types'

export default class Badge extends Component {
  static propTypes = {
    count: PropTypes.number
  }

  constructor(props) {
    super(props)
    this.state = {
    }
  }

  render() {
    let { count, ...props } = this.props
    let badgeClass = "t-badge"
    if (count > 99) {
      count = '99'
      badgeClass = badgeClass + "-plus"
    }
    return (
      <div className={badgeClass}><span>{count}</span></div>
    )
  }
}
