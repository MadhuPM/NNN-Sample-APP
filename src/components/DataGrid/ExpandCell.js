import React, {Component} from 'react';
import PropTypes from 'prop-types'
import {ROW_STATE, ID} from './BasicDataGrid';
export default class ExpandCell extends Component {
  static propTypes ={
    col: PropTypes.object,
    row: PropTypes.object,
    gridActions: PropTypes.object,
    groupIndent: PropTypes.number,
    index: PropTypes.number
  };

  render() {
    const {col, row, gridActions, index, groupIndent} = this.props;
    const cellData = row[col.dataKey];
    const rowstate = row[ROW_STATE];
    const label = rowstate.group ?
      <span className="dataGridGroupName">{`${rowstate.group}: `}</span> : null;
    const indent = (rowstate.level * groupIndent) + 12;
    let clickHandler = null;
    let divStyle = {paddingLeft: indent};
    let className = 'dataGridExpandCellNoChild';

    let content = col.cell && !rowstate.group ?
      (<col.cell row={row} value={cellData} col={col}
        rowId={row[ID]} gridActions={gridActions}
        level={rowstate.level} index={index}
       />) :
      <span>{cellData}</span>;

    if (rowstate.hasChildren) {
      clickHandler = gridActions.onRowExpand.bind(null, row, !rowstate.expanded);
      divStyle = {cursor: 'pointer', paddingLeft: indent};
      className = rowstate.expanded ? 'dataGridExpandCellExpanded' : 'dataGridExpandCell';
    }
    return (
      <div className="dataGridCustomCellWrapper" style={divStyle} onClick={clickHandler}>
        <div className={className}>{label}{content}</div>
      </div>
    );
  }
}
