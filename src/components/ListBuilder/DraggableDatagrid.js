import React, {Component} from 'react';
import PropTypes from 'prop-types'
import { findDOMNode } from 'react-dom';
import { DragSource, DropTarget } from 'react-dnd';
import DataGrid from '../DataGrid/DataGrid';

export const DRAGGABLE_DATAGRID = 'cdt/DraggableDatagrid';

const cellSource = {
  beginDrag(props) {
    return {
      selected: props.selected,
      left: props.left
    };
  },
  canDrag(props){
    return props.selected.length==0?false:true
  }
};

const cellTarget = {
    drop(props, monitor, component) {
    const item = monitor.getItem();
    const {left} = item;
    const {data, left: leftRow} = props;
    if (left===leftRow) {
        return;
      }
    props.onCrossDragDrop(left);
  }
};

@DropTarget(DRAGGABLE_DATAGRID, cellTarget, connect => ({
  connectDropTarget: connect.dropTarget()
}))
@DragSource(DRAGGABLE_DATAGRID, cellSource, (connect) => ({
  connectDragSource: connect.dragSource(),
  connectDragPreview:connect.dragPreview()
}))
export default class DraggableDatagrid extends Component {
  static propTypes = {
    gridActions: PropTypes.object,
    value: PropTypes.any,
    index: PropTypes.number,
    row: PropTypes.object,
    connectDropTarget: PropTypes.func,
    connectDragSource: PropTypes.func,
    connectDragPreview:PropTypes.func,
    selected:PropTypes.any,
    left:PropTypes.any
  }
  componentDidMount(){
		const img = new Image()
		img.src =
			'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='
		img.onload = () =>
			this.props.connectDragPreview && this.props.connectDragPreview(img)
  }
  render() {
    const {value, connectDropTarget, connectDragSource,selected,left,...props} = this.props;
    return connectDragSource(connectDropTarget(
        <div>
        <DataGrid
        keyFieldName='ID'
        hasFooter={false}
        syncCheckbox
        noDataMessage={'No Data'}
        hasTitle={false}
        hasCheckbox
        clearSelectionOnRefresh
        {...props}
        />
        </div>
    ));
  }
}
