import React, { Component } from 'react'
import PropTypes from 'prop-types'
import update from 'immutability-helper'
import raf from 'raf';
import DraggableHeaderCell, {ItemTypes} from './DraggableHeaderCell'
import { DropTarget } from 'react-dnd'
import Header from './Header'

const resizeTarget = {
  hover(props, monitor, component) {
    if (this.r) {
      raf.cancel(this.r);
    }
    const item = monitor.getItem();
    const initialOffset = monitor.getInitialClientOffset();
    const clientOffset = monitor.getClientOffset();
    const delta = clientOffset.x - initialOffset.x;
    this.r = raf(() => {
      component.resizeColumn(item.id, item.fixed, delta);
    });
  }
};


@DropTarget(ItemTypes.RESIZE_HANDLE, resizeTarget, connect => ({
  connectDropTarget: connect.dropTarget()
}))
export default class TableHeader extends Component {
  static propTypes = {
    connectDropTarget: PropTypes.func.isRequired,
    cols: PropTypes.array.isRequired,
    fixedCols: PropTypes.array.isRequired,
    scrollBarWidth: PropTypes.number.isRequired,
    headerHeight: PropTypes.number,
    width: PropTypes.number.isRequired,
    gridActions: PropTypes.object.isRequired,
    sort: PropTypes.array,
    groups: PropTypes.arrayOf(PropTypes.object),
    pageSize: PropTypes.number,
    dragDisabled: PropTypes.bool,
    oriColumns:PropTypes.any
  }

  static defaultProps = {
    headerHeight: 35
  }

  constructor(props) {
    super(props);
    const {cols, fixedCols} = props;
    this.state = { cols, fixedCols };
  }

  componentWillReceiveProps(props) {
    const {cols, fixedCols} = props;
    this.setState({ cols, fixedCols });
  }

  getHeaderCells(cols, rowHeight, isFixed) {
    const {gridActions, sort, groups, pageSize, dragDisabled, oriColumns, dataGridType, headerMenuItems, onHeaderMenuClick} = this.props;
    const wrap = rowHeight > 50;
    let col;
    let style;
    const cells = [];
    let left = 0;
    for (let i = 0; i < cols.length; i++) {
      col = cols[i];
      const id = col.dataKey;
      const keyString = isFixed ? 'fixed-' : '';
      style = {
        height: rowHeight,
        left,
        width: col.width
      };
      cells.push(
        <DraggableHeaderCell
          dragDisabled={dragDisabled || col.locked}
          startResizeColumn={this.startResizeColumn}
          endResizeColumn={this.endResizeColumn}
          commitReorderCells={this.commitReorderCells}
          setVisibleColumns={gridActions.setVisibleColumns}
          id={id}
          fixed={isFixed}
          index={i}
          moveCell={this.reorderCells}
          className="dataGridCell"
          style={style}
          key={i + keyString}
        >
          <Header
            oriColumns={oriColumns}
            cols={cols}
            col={col}
            pageSize={pageSize}
            gridActions={gridActions}
            groups={groups}
            sort={sort}
            wrap={wrap}
            dataGridType={dataGridType}
            headerMenuItems={headerMenuItems}
            onHeaderMenuClick={onHeaderMenuClick}
          />
        </DraggableHeaderCell>
      );
      left += col.width;
    }

    if (isFixed) {
      this.fixedWidth = left;
    } else {
      this.bodyHeaderWidth = left + this.props.scrollBarWidth;
    }

    return cells;
  }

  reorderCells = (draggedId, targetId, fixed) => {
    const {cols, fixedCols} = this.state;
    const dragCols = fixed ? fixedCols : cols;
    const col = dragCols.filter(x => x.dataKey === draggedId)[0];
    const targetCol = dragCols.filter(x => x.dataKey === targetId)[0];
    const colIndex = dragCols.indexOf(col);
    const targetColIndex = dragCols.indexOf(targetCol);
    const colIdentifier = fixed ? 'fixedCols' : 'cols';
    const newState = update(this.state, {
      [colIdentifier]: {
        $splice: [
          [colIndex, 1],
          [targetColIndex, 0, col]
        ]
      }
    });
    this.setState(newState);
  }

  commitReorderCells = () => {
    const {cols, fixedCols} = this.state;
    let colArray = fixedCols.map(col => col.dataKey).concat(cols.map(col => col.dataKey));
    colArray = colArray.filter(colName => colName !== '__selected__');
    this.props.gridActions.setVisibleColumns(colArray);
  }

  resizeColumn = (draggedId, fixed, offsetX) => {
    if (!this.isResizing) {
      return;
    }
    const {cols, fixedCols} = this.state;
    this.rcCol.width = Math.max(30, this.rcOriginalWidth + offsetX);
    this.setState({ fixedCols: fixedCols.slice(), cols: cols.slice() });
  }

  startResizeColumn = (key, fixed) => {
    this.isResizing = true;
    const {cols, fixedCols} = this.state;
    if (fixed) {
      this.rcCol = fixedCols.filter(x => x.dataKey === key)[0];
    } else {
      this.rcCol = cols.filter(x => x.dataKey === key)[0];
    }
    this.rcOriginalWidth = this.rcCol.width;
  }

  endResizeColumn = (dataKey) => {
    this.isResizing = false;
    this.props.gridActions.onColumnResize(this.rcCol.width, dataKey);
  }

  render() {
    const {headerHeight, width, connectDropTarget} = this.props;
    const {cols, fixedCols} = this.state;

    const headerCells = this.getHeaderCells(cols, headerHeight, false);
    const fixedHeaderCells = this.getHeaderCells(fixedCols, headerHeight, true);

    const headerContainerStyle = {
      width,
      height: headerHeight
    };

    const fixedWidth = this.fixedWidth;
    const bodyHeaderWidth = this.bodyHeaderWidth;

    return connectDropTarget(
      <div className="dataGridHeaderContainer"
        style={headerContainerStyle}
      >
        <div ref={(c) => { this.fixedHeaderContainer = c; }}
          className="dataGridHeaderFixed"
          style={{ height: headerHeight, width: fixedWidth }}
        >
          {fixedHeaderCells}
        </div>
        <div
          className="dataGridHeader"
          style={{ height: headerHeight, left: fixedWidth, width: bodyHeaderWidth }}
        >
          {headerCells}
        </div>
      </div>
    );
  }
}
