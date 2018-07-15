import React, {Component} from 'react';
import PropTypes from 'prop-types'
import { findDOMNode } from 'react-dom';
import { DragSource, DropTarget } from 'react-dnd';

export const DRAGGABLE_GRID_CELL = 'cdt/DraggableGridCell';

const cellSource = {
  beginDrag(props) {
    return {
      id: props.rowId,
      index: props.index
    };
  }
};

const cellTarget = {
  hover(props, monitor, component) {
    const item = monitor.getItem();
    const {index: dragIndex, row: dragRow} = item;
    const {index: hoverIndex, row: hoverRow} = props;

    if (dragIndex === hoverIndex) {
      return;
    }

    const hoverBoundingRect = findDOMNode(component).getBoundingClientRect();
    const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
    const clientOffset = monitor.getClientOffset();
    const hoverClientY = clientOffset.y - hoverBoundingRect.top;
    if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
      return;
    }

    if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
      return;
    }
    props.gridActions.onDragDrop(dragIndex, hoverIndex, dragRow, hoverRow);
    item.index = hoverIndex;
  }
};

@DropTarget(DRAGGABLE_GRID_CELL, cellTarget, connect => ({
  connectDropTarget: connect.dropTarget()
}))
@DragSource(DRAGGABLE_GRID_CELL, cellSource, (connect) => ({
  connectDragSource: connect.dragSource()
}))
export default class DraggableCell extends Component {
  static propTypes = {
    gridActions: PropTypes.object,
    value: PropTypes.any,
    index: PropTypes.number,
    row: PropTypes.object,
    connectDropTarget: PropTypes.func,
    connectDragSource: PropTypes.func
  }

  render() {
    const {value, connectDropTarget, connectDragSource} = this.props;
    return connectDragSource(connectDropTarget(
      <div className='dataGridCellContent' >
        <span>{value}</span>
      </div>
    ));
  }
}
