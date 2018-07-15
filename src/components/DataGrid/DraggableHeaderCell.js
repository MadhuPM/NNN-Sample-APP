import React, { Component } from 'react';
import PropTypes from 'prop-types'
import ReactDOM from 'react-dom';
import { DragSource, DropTarget } from 'react-dnd';

export const ItemTypes = {
  HEADER_CELL: 'cdt/headerCell',
  RESIZE_HANDLE: 'cdt/resizeHandle'
};

const resizeSource = {
  beginDrag(props) {
    props.startResizeColumn(props.id, props.fixed);
    return { id: props.id, fixed: props.fixed };
  },
  endDrag(props) {
    props.endResizeColumn(props.id);
  }
};

const cellSource = {
  beginDrag(props) {
    return {
      id: props.id,
      index: props.index,
      fixed: props.fixed
    };
  },
  canDrag(props) {
    return !props.dragDisabled;
  }
};

const cellTarget = {
  hover(props, monitor, component) {
    if (props.dragDisabled) {
      return;
    }
    const ownId = props.id;
    const draggedId = monitor.getItem().id;
    if (draggedId === ownId) {
      return;
    }

    const ownIndex = props.index;
    const ownFixed = props.fixed;
    const draggedIndex = monitor.getItem().index;
    const draggedFixed = monitor.getItem().fixed;

    if (ownFixed !== draggedFixed) {
      return;
    }

    const boundingRect = ReactDOM.findDOMNode(component).getBoundingClientRect();
    const clientOffset = monitor.getClientOffset();
    const ownMiddleX = (boundingRect.right - boundingRect.left) / 2;
    const offsetX = clientOffset.x - boundingRect.left;

    if (draggedIndex < ownIndex && offsetX < ownMiddleX) {
      return;
    }

    if (draggedIndex > ownIndex && offsetX > ownMiddleX) {
      return;
    }

    props.moveCell(draggedId, ownId, draggedFixed);
  },

  drop(props) {
    if (props.dragDisabled) {
      return;
    }
    props.commitReorderCells();
  }

};

@DragSource(ItemTypes.RESIZE_HANDLE, resizeSource, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging()
}))
class ResizeHandle extends Component {
  static propTypes = {
    connectDragSource: PropTypes.func.isRequired,
    isDragging: PropTypes.bool.isRequired,
    id: PropTypes.any.isRequired,
    fixed: PropTypes.bool.isRequired,
    startResizeColumn: PropTypes.func.isRequired,
    endResizeColumn: PropTypes.func.isRequired,
    commitReorderCells: PropTypes.func.isRequired
  }

  render() {
    const {connectDragSource} = this.props;
    return connectDragSource(<div className="dataGridResizeHandle" />);
  }
}

@DropTarget(ItemTypes.HEADER_CELL, cellTarget, connect => ({
  connectDropTarget: connect.dropTarget()
}))
@DragSource(ItemTypes.HEADER_CELL, cellSource, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging()
}))

export default class DraggableHeaderCell extends Component {
  static propTypes = {
    connectDragSource: PropTypes.func.isRequired,
    connectDropTarget: PropTypes.func.isRequired,
    isDragging: PropTypes.bool.isRequired,
    index: PropTypes.number.isRequired,
    id: PropTypes.any.isRequired,
    fixed: PropTypes.bool.isRequired,
    children: PropTypes.node,
    moveCell: PropTypes.func.isRequired,
    startResizeColumn: PropTypes.func.isRequired,
    endResizeColumn: PropTypes.func.isRequired,
    commitReorderCells: PropTypes.func.isRequired,
    style: PropTypes.object,
    className: PropTypes.string,
    dragDisabled: PropTypes.bool
  };

  render() {
    const { commitReorderCells,
      startResizeColumn,
      endResizeColumn,
      fixed,
      id,
      children,
      style,
      className,
      isDragging,
      connectDragSource,
      connectDropTarget
    } = this.props;
    const opacity = isDragging ? 0.5 : 1;

    return connectDragSource(connectDropTarget(
      <div className={className} style={{ ...style, opacity }}>
        {children}
        <ResizeHandle
          startResizeColumn={startResizeColumn}
          endResizeColumn={endResizeColumn}
          commitReorderCells={commitReorderCells}
          id={id} fixed={fixed} 
        />
      </div>
    ));
  }
}
