import React, {Component} from 'react';
import { PropTypes } from "prop-types"
import ReactDOM from 'react-dom';
import {FormattedDate, FormattedNumber, injectIntl, intlShape} from 'react-intl';
import Scroller from './Scroller';
//import raf from 'raf';
import TableHeader from './TableHeader';
import getScrollbarWidth from '../util/getScrollbarWidth';
import classNames from 'classnames';
import {ROW_STATE, ID} from './BasicDataGrid';
import ExpandCell from './ExpandCell';
import CellEditor from './CellEditor';
import RowOverflowMenu from './RowOverflowMenu';
import moment from "moment";

@injectIntl
export default class TableBody extends Component {

  static propTypes = {
    data: PropTypes.array,
    columns: PropTypes.array,
    pageSize: PropTypes.number,
    rowGetter: PropTypes.func,
    rowCount: PropTypes.number,
    height: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
    useTranslate3d: PropTypes.bool,
    rowHeight: PropTypes.oneOfType([PropTypes.func, PropTypes.number]),
    headerHeight: PropTypes.number,
    gridActions: PropTypes.object.isRequired,
    sort: PropTypes.array,
    stripe: PropTypes.bool,
    hasCheckbox: PropTypes.bool,
    hasGroupColumn: PropTypes.bool,
    groups: PropTypes.arrayOf(PropTypes.object),
    noDataMessage: PropTypes.string,
    isLoading: PropTypes.bool,
    hasHeader: PropTypes.bool,
    intl: intlShape.isRequired,
    dragDisabled: PropTypes.bool,
    groupIndent: PropTypes.number,
    enableTextSelection: PropTypes.bool,
    autoColumnWidth: PropTypes.bool,
    oriColumns:PropTypes.any,
    hasHoverAction:PropTypes.any,
    rowActionMenu:PropTypes.any,
    calcHeight:PropTypes.any,
    showPage: PropTypes.func,
    scrollLimit: PropTypes.number

  };

  static defaultProps = {
    columns: [],
    data: [],
    height: 200,
    width: 200,
    useTranslate3d: false,
    rowHeight: 50,
    headerHeight: 50,
    hasHeader: true,
    hasTitle: true
  };

  constructor(props) {
    super(props);
    const {hasHeader} = props;
    this.scrollBarWidth = hasHeader ? getScrollbarWidth() : 0;
    if(this.scrollBarWidth > 0) {
      this.scrollBarWidth = 6;
    }

    this.state = this.getState(props);
    this.tabIndex = 1;
    this.editZIndex = 1;
  }

  componentWillReceiveProps(nextProps) {
    this.setState(this.getState(nextProps));
    if (this.refs.scroller) {
      this.refs.scroller.forceUpdate();
    }
  }

  getState(props) {
    const {columns, hasCheckbox, hasGroupColumn, width, height, headerHeight, autoColumnWidth} = props;

    let groupColKey = hasCheckbox && columns.length > 1 ? columns[1].dataKey : columns[0].dataKey;
    groupColKey = hasGroupColumn ? groupColKey : null;

    let col;
    let fixedWidth = 0;
    let bodyWidth = 0;

    const fixedCols = [];
    const cols = [];
    let starColumn;
    const starColumns = [];
    for (let i = 0; i < columns.length; i++) {
      col = columns[i];
      if (col.width === '*') {
        starColumn = {...col, width: 70};
        starColumns.push(starColumn);
        if (col.fixed) {
          fixedCols.push(starColumn);
        } else {
          cols.push(starColumn);
        }
        continue;
      }
      if (col.fixed || col.dataKey === groupColKey) {
        fixedWidth += col.width;
        fixedCols.push(col);
      } else {
        bodyWidth += col.width;
        cols.push(col);
      }
    }

    const colWidth = bodyWidth + fixedWidth;
    const gap = width - colWidth;
    const sbGap = this.scrollBarWidth + 2;
    const starColumnsCount = starColumns.length;
    if (starColumnsCount > 0) {
      const starWidth = (gap - sbGap) / starColumnsCount;
      starColumns.forEach(starCol => {
        if (gap > (starColumnsCount * 70)) {
          starCol.width = starWidth;
        }
        if (starCol.fixed) {
          fixedWidth += starCol.width;
        } else {
          bodyWidth += starCol.width;
        }
      });
    } else if (gap > sbGap && cols.length > 0 && autoColumnWidth) {
      const extraWidth = gap - sbGap;
      const count = cols.length;
      const colExtraWidth = extraWidth / count;
      for (let i = 0; i < count; i++) {
        const adjCol = cols[i];
        cols[i] = {...adjCol, width: adjCol.width += colExtraWidth};
      }
      bodyWidth += extraWidth;
    }

    const bodyHeaderWidth = bodyWidth + sbGap;
    const hasFixedCols = fixedWidth > 0;
    const bodyContainerHeight = height - headerHeight - 2;
    const bodyContainerWidth = width - this.scrollBarWidth;
    return {
      fixedWidth, bodyWidth, fixedCols, cols, bodyContainerWidth,
      bodyHeaderWidth, hasFixedCols, groupColKey, bodyContainerHeight
    };
  }

  getCells(cols, row, rowHeight, index, isEdit, bottomOffset) {
    const {groupColKey, bodyContainerWidth} = this.state;
    const {gridActions, groupIndent, enableTextSelection} = this.props;
    const gridCellClass = classNames('dataGridCell', {dataGridCellTextSelect: enableTextSelection});

    let col;
    let style;
    const cells = [];
    let left = 0;

    for (let i = 0; i < cols.length; i++) {
      col = cols[i];
      const rightOffset = bodyContainerWidth - left - col.width;

      style = {
        height: rowHeight,
        lineHeight:rowHeight+'px',
        left: isEdit && col.edit ? left + 1 : left,
        width: isEdit && col.edit ? col.width - 2 : col.width,
        border: '1px solid transparent',
        textAlign: col.align
      };

      if (isEdit & col.edit) {
        style.top = 2;
        style.border = 'none';
      }

      let content;
      if (isEdit && col.edit) {
        col.editor = col.editor || CellEditor;
        const rowState = row[ROW_STATE];
        const {editErrors = {}, editIndex} = rowState;
        const error = editErrors[col.dataKey];
        content = (
          <div className={gridCellClass} style={style} key={i}>
            <col.editor rowId={row[ID]} value={row[col.dataKey]} col={col} key={i}
              onChange={gridActions.onChange} tabIndex={this.tabIndex++}
              error={error} rightOffset={rightOffset} editIndex={editIndex}
              rowHeight={rowHeight} row={row} index={index}
              gridActions={gridActions} bottomOffset={bottomOffset}
            />
          </div>);
      }  else if (col.cell) {
        content = (
          <div className={gridCellClass} style={style} key={i}>
            <col.cell rowId={row[ID]} value={row[col.dataKey]}
              col={col} key={i} rightOffset={rightOffset}
              row={row} index={index} gridActions={gridActions}
              isEdit={isEdit} bottomOffset={bottomOffset}
            />
          </div>);
      } else {
        content = this.getFormatter(col, row[col.dataKey], style, i);
      }

      cells.push(content);
      left += col.width;
    }

    return cells;
  }

  getFormatter(col, val, style, key) {
    const {enableTextSelection} = this.props;
    const className = classNames('dataGridCellText', {dataGridCellTextSelect: enableTextSelection});
    const format=col.dateFormat || col.format?col.dateFormat||col.format:'MM/DD/YYYY HH:mm:ss'

    switch (col.dataType) {
      case 'date':
      case 'datetime':
        if (val instanceof Date) {
          let formattedDate=''
          if(moment(val).isValid() && val!==undefined){
            formattedDate = moment(val).format(format)
          } else{
            formattedDate = "";
          }
          return (
            <div className={className} style={style} key={key}>{formattedDate}</div>
          )
        }
        // eslint-disable-next-line
      case 'number':
        if (val !== null && !isNaN(val)) {
          return (
            <FormattedNumber value={val} format={col.numberFormat} key={key} >
            {
              (formattedNumber) => (
                <div className={className} style={style} key={key}>{formattedNumber}</div>
              )
            }
            </FormattedNumber>
          );
        }
        // eslint-disable-next-line
      case 'bigdecimal':
      if (val !== null && val !== undefined) {
        return (<div className={className} style={style} key={key}>{val.toString()}</div>)
      }
      // eslint-disable-next-line
      default:
      // console.log(val)
        return <div className={className} style={style} key={key}>{val}</div>;
    }
  }

  autoResizeColumn = (column) => {
    const {gridActions} = this.props;
    const newWidth = this.getMaxColumnWidth(column);
    gridActions.onColumnResize(newWidth + 4, column.dataKey);
  }

  getMaxColumnWidth = (column) => {
    if (!this.refs.scroller) {
      return 40;
    }
    const {cols, fixedCols} = this.state;
    const fixed = fixedCols.indexOf(column) !== -1;
    const columns = fixed ? fixedCols : cols;
    const containerIndex = fixed ? 0 : 1;
    const index = this.getColumnIndex(column, columns);
    const scrollDiv = ReactDOM.findDOMNode(this.refs.scroller);
    const container = scrollDiv.querySelectorAll('.dataGridColumnContainer')[containerIndex];
    const rows = container.childNodes;
    const rowCount = rows.length;
    let row;
    let cellDiv;
    let cellWidth;
    let maxWidth = 40;

    const testSpan = document.createElement('div');
    testSpan.className = column.cell ? 'dataGridCell' : 'dataGridCellText';
    testSpan.style.cssText = 'display: inline-block;';
    scrollDiv.appendChild(testSpan);

    for (let i = 0; i < rowCount; i++) {
      row = rows[i];
      cellDiv = row.childNodes[index];
      testSpan.innerHTML = cellDiv.innerHTML.replace('dataGridCustomCellWrapper', '');
      cellWidth = testSpan.clientWidth;
      maxWidth = Math.max(maxWidth, cellWidth);
    }
    scrollDiv.removeChild(testSpan);
    return maxWidth + 8;
  }

  getColumnIndex = (column, columns) => {
    if (columns) {
      for (let i = 0; i < columns.length; i++) {
        if (columns[i].dataKey === column.dataKey) {
          return i;
        }
      }
    }
    return -1;
  }

  moveToTop = (e) => {
    let el = e.target;
    for (let i = 0; i < 100; i++) {
      el = el.parentElement;
      if (el.classList.contains('dataGridRow')) {
        break;
      }
    }
    el.style.zIndex = this.editZIndex++;
  }

  itemSizeGetter=(index)=>{
      const {data,rowHeight}= this.props
      if(rowHeight &&isNaN(rowHeight)){
        return rowHeight(data[index])
      }
      return rowHeight
  }
  renderItem = (index, key) => {
    const {rowGetter, stripe, gridActions, data,hasHoverAction, rowActionMenu, width} = this.props;
    let {rowHeight}= this.props
    const {bodyContainerHeight} = this.state;
    const row = rowGetter(index);
    const hover = gridActions.onRowHover.bind(null, row, index);
    const hoverOut = gridActions.onRowHoverOut.bind(null, row, index);
    const click = gridActions.onRowClick.bind(null, row, index);
    const dClick = gridActions.onRowDoubleClick ?
      gridActions.onRowDoubleClick.bind(null, row, index) : null;
    const {fixedWidth, bodyWidth, fixedCols, cols} = this.state;
    const rowstate = row[ROW_STATE];
    const {edit, level} = rowstate;

    let top=0
    if(rowHeight &&isNaN(rowHeight)){
        rowHeight=rowHeight(data[index])
      if(key){
        const lastRowState=rowGetter(index-1)[ROW_STATE]
        top= lastRowState.top+lastRowState.height
      }
      this.containerHeight=top+rowHeight
      rowstate.height=rowHeight
      rowstate.top=top
    }else{
      top = key * rowHeight
      this.containerHeight=null
    }
    const bottomOffset = bodyContainerHeight - top - rowHeight;
    const fixedCells = this.getCells(fixedCols, row,
      rowHeight, index, edit, bottomOffset);
    const cells = this.getCells(cols, row, rowHeight, index, edit, bottomOffset);
    const customStyle = gridActions.getRowStyle ? gridActions.getRowStyle(row, index) : '';
    const levelStyle = `dataGridRowLevel-${level}`;
    const className = classNames('dataGridRow',
      {dataGridRowAlt: stripe && index % 2 === 0},
      {dataGridRowSelected: rowstate.clicked && !edit},
      {dataGridRowHovered: rowstate.hovered && !edit},
      {dataGridRowEdit: edit}, levelStyle, customStyle
    );

    const rowStyle = {
      width: bodyWidth,
      top,
      height: rowHeight
    };

    const fixedRowStyle = {
      width: fixedWidth,
      top,
      height: rowHeight
    };

    const scrollLeft = isNaN(this.scrollLeft) ? 0 : this.scrollLeft;

    const hoverFlag = rowstate.hovered && !edit && hasHoverAction && rowActionMenu ? true : false;
    const hoverLeft = (bodyWidth + fixedWidth) < width ? bodyWidth - rowHeight : scrollLeft + width - fixedWidth - rowHeight;
    const hoverDivStyle = {
          position: 'absolute',
          left: hoverLeft,
          top: rowHeight/2 - 10,
          background: hoverFlag ? "#e1ecf2" : "transparent"
    };
    const rowHoverDiv = <RowOverflowMenu isHovered={hoverFlag} hoverDivStyle={hoverDivStyle} rowActionMenu={rowActionMenu} />;

    if (edit) {
      return (
        [<div className={className} onClick={this.moveToTop} style={fixedRowStyle} key={key}>{fixedCells}</div>,
          <div className={className} onClick={this.moveToTop} style={rowStyle} key={key}>{cells}</div>]
      );
    }
    return (
      [<div className={className} onClick={click} onMouseOut={hoverOut} onMouseOver={hover} onDoubleClick={dClick} style={fixedRowStyle} key={key}>{fixedCells}</div>,
      <div className={className} onClick={click} onMouseLeave={hoverOut} onMouseEnter={hover} onDoubleClick={dClick} style={rowStyle} key={key}>{cells}{rowHoverDiv}</div>]
    );
  }

  itemsContainerRender = (items, ref) => {
    const {fixedWidth, bodyWidth} = this.state;
    const {rowHeight} = this.props;
    let height = this.containerHeight?this.containerHeight:rowHeight * items[1].length;
    isNaN(height) && (height=0)
    return (
      <div ref={ref}>
        <div
          ref={(c) => { this.fixedColumnContainer = c; }}
          className="dataGridColumnContainer dataGridFixed"
          key="fixed"
          style={{width: fixedWidth, height}}
        >
          {items[0]}
        </div>
        <div
          className="dataGridColumnContainer"
          key="body"
          style={{left: fixedWidth, width: bodyWidth, height}}
        >
          {items[1]}
        </div>
      </div>
    );
  }

  customScrollSync = (scrollLeft) => {
    this.scrollLeft = scrollLeft;

    // if (this.r) {
    //   raf.cancel(this.r);
    // }
    //this.r = raf(() => {
      const headerContainer = this.refs.headerContainer.getDecoratedComponentInstance();
      const header = ReactDOM.findDOMNode(headerContainer);
      header.scrollLeft = this.scrollLeft;
      const transform = this.props.useTranslate3d ?
        `translate3d(${this.scrollLeft}px, 0, 0)` : `translate(${this.scrollLeft}px, 0)`;
      const el = headerContainer.fixedHeaderContainer;
      el.style.MsTransform = transform;
      el.style.WebkitTransform = transform;
      el.style.transform = transform;
      const fixedCols = this.fixedColumnContainer;
      fixedCols.style.MsTransform = transform;
      fixedCols.style.WebkitTransform = transform;
      fixedCols.style.transform = transform;
    //});
  }

  render() {
    this.tabIndex = 1; // reset tabIndex
    const {groups, sort, gridActions, useTranslate3d, width, pageSize, height, rowCount, showPage, scrollLimit, limit, params,
      noDataMessage, isLoading, hasHeader, dragDisabled, oriColumns, rowActionMenu, hasHoverAction, headerMenuItems, onHeaderMenuClick, dataGridType} = this.props;
    const headerGridActions = {...gridActions, autoResizeColumn: this.autoResizeColumn};
    const headerHeight = hasHeader ? this.props.headerHeight : 0;
    const { fixedCols, cols, bodyWidth, fixedWidth, showRowHoverMenu} = this.state;
    const bodyScrollerStyle = {
      top: headerHeight,
      height: height - headerHeight - 2,
      width: width - 2
    };
    const loadingMessage = isLoading ? 'Loading...' : null;
    let noDataDiv = null;
    let noDataScroll = null;
    if (rowCount === 0) {
      noDataDiv = (
        <div style={{padding: 20, textAlign: 'center', position: 'absolute', left: 0, right: 0}}>
          {loadingMessage || noDataMessage}
        </div>
      );
      noDataScroll = (
          <div style={{overflow: 'auto', width: bodyWidth + fixedWidth, height: 0}} />
      );
    }

    let tableMain = (
      <div
        className="dataGridScroller" key='dataGridScroller'
        style={bodyScrollerStyle}
      >
        {noDataDiv}
        <Scroller ref="scroller"
          itemRenderer={this.renderItem}
          itemsRenderer={this.itemsContainerRender}
          length={rowCount}
          pageSize={20}
          threshold={100}
          itemSizeGetter={this.itemSizeGetter}
          useTranslate3d={useTranslate3d}
          type={isNaN(this.props.rowHeight)?"variable":"uniform"}
          rowHeight={this.props.rowHeight}
          showPage={showPage}
          scrollLimit={scrollLimit}
          limit={limit}
          customScrollSync={hasHeader ? this.customScrollSync : null}
          params={params}
        />
      </div>
      );

    const header = hasHeader ? (
      <TableHeader
        ref="headerContainer"
        oriColumns={oriColumns}
        cols={cols}
        fixedCols={fixedCols}
        scrollBarWidth={this.scrollBarWidth}
        headerHeight={headerHeight}
        width={width - 2}
        gridActions={headerGridActions}
        sort={sort}
        groups={groups}
        pageSize={pageSize}
        dragDisabled={dragDisabled}
        dataGridType={dataGridType}
        headerMenuItems={headerMenuItems}
        onHeaderMenuClick={onHeaderMenuClick}
      />
    ) : undefined;


    return (

      <div className='design2DataGridTableBody' style={{height, width}}>
            {header}
            {tableMain}
      </div>
    );
  }
}
