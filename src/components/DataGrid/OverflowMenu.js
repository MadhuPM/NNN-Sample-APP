import React, { Component } from 'react';
import { PropTypes } from 'prop-types'
import Menu, {SubMenu, MenuItem} from '../Menu';

export default class OverflowMenu extends Component {
  static propTypes = {
	overflowMenu: PropTypes.array,
	gridActions: PropTypes.object,
	columns: PropTypes.array,
	params: PropTypes.oneOfType([PropTypes.array, PropTypes.object])
	}

	exportExcel = () => {
    const {params, columns, gridActions} = this.props
    gridActions.onExportExcel(params, columns)
	}

	exportCsv = () => {
		const {params, columns, gridActions} = this.props
		gridActions.onExportCsv(params, columns)
	}

	onRefresh = () => {
		const {onClientRefresh, params, refresh, clearSelectionOnRefresh, gridActions} = this.props;
		if(onClientRefresh) {
      if (clearSelectionOnRefresh) {
        gridActions.resetState();
      }
			return onClientRefresh();
		}

    if (refresh) {
      if (clearSelectionOnRefresh) {
        gridActions.resetState();
      }
      refresh(params);
    }
	}

  render() {
		const {overflowMenu, gridActions, refresh, onClientRefresh} = this.props;
		let menu = overflowMenu ? overflowMenu.slice() : []
		if (gridActions.onExportExcel) {
			menu.push(<MenuItem key='exportExcel' onSelect={this.exportExcel}>
			Export to Excel
		</MenuItem>)
		}
		if (gridActions.onExportCsv) {
			menu.push(<MenuItem key='exportCsv' onSelect={this.exportCsv}>
			Export to Csv
		</MenuItem>)
		}
		if(onClientRefresh || refresh){
			menu.push(<MenuItem key='refreshTable' onSelect={this.onRefresh}>Refresh</MenuItem>)
		}

		return (
			<Menu>
				{menu}
			</Menu>
		);
	}
}
