import React, { Component } from 'react'
import { Col } from 'react-bootstrap'
import { findDOMNode } from 'react-dom';
import { PropTypes } from "prop-types"

//use ItemTypes in DragSource & DropTarget, they are all in this file
import { ItemTypes } from './LConstants'
import { DragSource, DropTarget } from 'react-dnd'

const style = {
	cursor: 'move'
}

const colSource = {
  beginDrag(props, monitor){
    return {
			id: props.id,
      index: props.index
    }
  }
}

const colTarget = {
	hover(props, monitor, component) {
		const dragIndex = monitor.getItem().index
		const hoverIndex = props.index
		// Don't replace items with themselves
		if (dragIndex === hoverIndex) {
			return
		}
    props.moveChild(dragIndex, hoverIndex)
		monitor.getItem().index = hoverIndex
  },
  drop(props){
    props.callback()
  }
}

@DropTarget(ItemTypes.LCOL, colTarget, connect => ({ connectDropTarget: connect.dropTarget()}))
@DragSource(ItemTypes.LCOL, colSource, (connect, monitor) => ({ connectDragSource: connect.dragSource(), isDragging: monitor.isDragging()}))
export default class LCol extends Component {
	static propTypes = {
    callback:PropTypes.any,
    children:PropTypes.any,
    connectDragSource:PropTypes.any,
    connectDropTarget:PropTypes.any,
    isDragging:PropTypes.any,
    index:PropTypes.any,
    moveChild:PropTypes.any
	}
  render() {
    const { callback, children, connectDragSource, connectDropTarget, isDragging, index, moveChild, ...props  } = this.props

    return (
        <Col {...props}
          ref={(instance) =>{
              this.props.connectDropTarget(findDOMNode(instance))
              this.props.connectDragSource(findDOMNode(instance))
          }}
        >
          {children}
        </Col>
    )
  }
}
