import React, { Component } from 'react';
import { PropTypes } from "prop-types"
import Filter from '../Filter';
import OverflowMenu from './OverflowMenu';

const selectOptions=[{value:'Asset',label:'Asset'},{value:'Manager',label:'Manager'},{value:'Fund',label:'Fund'},{value:'Units',label:'Units'}]

export default class TitleBar extends Component {
  static propTypes = {
    width: PropTypes.number.isRequired,
    title: PropTypes.string,
    height:PropTypes.any,
    hasOverflowMenu:PropTypes.any,
    overflowMenu:PropTypes.any,
    clearFilter:PropTypes.any,
    showOptions:PropTypes.any,
    params:PropTypes.any,
    refresh:PropTypes.any,
    clearSelectionOnRefresh:PropTypes.any,
    gridActions:PropTypes.any,
    columns: PropTypes.array
  }

  render() {
    const {width, title, height, hasOverflowMenu, overflowMenu, params, clearSelectionOnRefresh, onClientRefresh, refresh, gridActions, columns} = this.props;
    const menu = hasOverflowMenu ?
          (<div className="DataGridOverflowMenu">
              <OverflowMenu
                customMenuItems={overflowMenu}
                overflowMenu={overflowMenu}
                params={params}
                columns={columns}
                onClientRefresh={onClientRefresh}
                gridActions={gridActions}
                refresh={refresh}
                clearSelectionOnRefresh={clearSelectionOnRefresh}
              />
          </div>) : null;

    return (
      <div className="tableTitleBar" style={{display: 'flex', width: width, height: height }}>
        <span className="tableTitle">{title}</span>
        {menu}
      </div>
    )
  }
}
