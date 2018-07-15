import React, {Component} from 'react';
import PropTypes from 'prop-types'
import {ROW_STATE, ID} from './BasicDataGrid';
export default class AccordionCell extends Component {
  static propTypes ={
    row: PropTypes.object,
    onRowExpand: PropTypes.func
  };

  render() {
    const {row, onRowExpand} = this.props;
    const rowstate = row[ROW_STATE];
    const label = rowstate.group ?
      <span className="dataGridGroupName">{`${rowstate.group}: `}</span> : null;
    let clickHandler = null;
    let className = 'dataGridExpandCellNoChild';

    if (rowstate.hasChildren) {
      clickHandler = onRowExpand.bind(null, row, !rowstate.expanded);
      //divStyle = {cursor: 'pointer', paddingLeft: indent};
      className = rowstate.expanded ? 'dataGridAccordionCellExpanded' : 'dataGridAccordionCell';
    }
    return (
      <div className="dataGridCustomCellWrapper" style={{padding: "17px 0 0 15px"}} onClick={clickHandler} >
        <div className={className}></div>
      </div>
    );
  }
}
