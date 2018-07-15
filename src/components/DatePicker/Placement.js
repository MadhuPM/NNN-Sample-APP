import React from "react"
import PropTypes from "prop-types"

let Placement = (props) => {
  let { style, children, p, positionTop, positionLeft, offsetX } = props
  let top = (positionTop ) + 'px'
  let left = offsetX?(positionLeft + offsetX + 140) + 'px':(positionLeft + 140) + 'px'
  return (
    <div style={{ top,left,position:'absolute' }} className={p}>
      {children}
    </div>
  )
}

Placement.propTypes = {
  p: PropTypes.string,
  positionLeft: PropTypes.number,
  positionTop: PropTypes.number,
  offsetX: PropTypes.number,
  children: PropTypes.node,
  style: PropTypes.object
}

export default Placement