import React, {Component} from 'react';
import TableBody from './TableBody';
//import Footer from './Footer';
import Filter from './Filter';
import autoResize from '../util/autoResize';
import {DataGridPropTypes} from './DataGridPropTypes';
import debounce from 'lodash/debounce';
import isEqual from 'lodash/isEqual';
import TitleBar from './TitleBar';
import Icon from '../Icon';
import AccordionCell from './AccordionCell';
import Checkbox from '../Form/Checkbox';
import {serializeCloudFilter} from './serializeCloudFilter';
//import FavoriteEditDialog from './FavoriteEditDialog';

export const ROW_STATE = '__state__';
export const ROOT = '__root__';
export const ID = '__id__';
const CHUNK = 5000;
const PADDING = 100;

//const ALTERNATE_CHECK_BEHAVIOR = 'ALTERNATE_CHECK_BEHAVIOR';
//const CHECK_INDEPENDENT = 'CHECK_INDEPENDENT';
const scaleMultiplier = [0.65, 0.75, 1];

@autoResize
export default class BasicDataGrid extends Component {
  static propTypes = DataGridPropTypes;

  static defaultProps = {
    columns: [],
    data: [],
    hasFooter: true,
    hasHeader: true,
    hasConfigDialog: true,
    defaultExpansionLevel: 0,
    isLoading: false,
    hasCheckbox: false,
    hasPriority: false,
    scrollToRow: 0,
    startRow: 0,
    noDataMessage: 'No data to display',
    scale: 2,
    headerHeight: 50,
    rowHeight: 50,
    groupIndent: 10,
    dragDisabled: false,
    conjunction: 'AND',
    hasTitle: true
  }

  constructor(props) {
    super(props);
    // fix for IE shift-selection issue
    const isIE = window.navigator.userAgent.indexOf('Trident/') > 0;
    const needsSelectionFix = props.enableTextSelection ? false : isIE;

    this.disableSelection = needsSelectionFix ? (e) => {
      const tag = e.target && e.target.tagName;
      if (tag !== 'INPUT' && tag !== 'TEXTAREA') {
        e.preventDefault();
      }
    } : null;

    this.PARENT_ID = props.parentFieldName || '__parentId__';
    this.keyFieldName = props.keyFieldName;
    this.hasChildrenFieldName = props.hasChildrenFieldName;

    this.alternateCheckBehavior = false;
    this.checkIndependent = false;

    this.emptyRow = {};
    this.emptyRow[ROW_STATE] = {
      selected: false,
      clicked: false,
      expanded: false,
      level: 0
    };

    this.originalData = []; // keep for filter reset
    this.data = undefined; // data received from service

    this.viewData = []; // data shown in grid
    this.requestedRow = 0;
    this.rangeStart = 0;
    this.rangeEnd = CHUNK * 2;
    this.rowCount = 0;
    // debounce checkRange
    this.checkRange = debounce(this.checkRange, 100);

    // row attributes
    this.stateMap = {};
    this.keyArray = [];

    this.childMap = {};
    this.parentMap = {};

    // edit row attributes
    this.editRow = props.editRow;
    this.editErrors = props.editErrors;
    this.newRowPositionID = props.newRowPositionID;
    this.editRowArray = props.editRow ? [
      {
        editRow: props.editRow,
        newRowPositionID: props.newRowPositionID,
        editErrors: props.editErrors
      }] : props.editRowArray;

    this.filter = props.filter || [];
    this.conjunction = props.conjunction;
    this.filterFunction = [];
    this.groups = props.groups || [];
    this.serverDefinedGrouping = !!(props.keyFieldName && props.parentFieldName);
    this.hasGroupColumn = this.groups.length > 0 || this.serverDefinedGrouping;

    this.sort = props.sort || [];
    this.sortFunction = undefined;
    this.groupSortFunction = undefined;
    this.setSort(props.sort);

    const columns = this.getColumnsFromProps(props);
    this.currentFavoriteId = undefined;
    this.state = {
      columns,
      rowCount: 0,
      sort: this.sort,
      filter: this.filter,
      showOptions: false,
      showFavorite: false
    };
    this.setFilters(this.filter);
  }


  componentDidMount() {
    const {data, actions} = this.props;
    // fix user-select:none for IE11 and shift-click selection
    if (this.gridContainer && this.disableSelection) {
      this.gridContainer.addEventListener('selectstart', this.disableSelection);
    }
    if (data) {
      this.setData(data);
    }
  }

  componentWillReceiveProps(nextProps) {
    const {data, actions, filter, sort, columns, editRow, editErrors, params,
      editRowArray, groups, newRowPositionID, conjunction, hasFavoriteConfig, gridFavorite, dataGridType, cloudSort} = nextProps;

    if (this.props.columns !== columns) {
      this.setState({ columns: this.getColumnsFromProps(nextProps) }, this.onStateChange);
    }

    let needsRedraw = false;

    if (this.props.conjunction !== conjunction) {
      this.conjunction = conjunction;
      needsRedraw = true;
    }

    if (this.props.sort !== sort) {
      this.setSort(sort);
      needsRedraw = true;
    }

    if (dataGridType === "cloud" && cloudSort) {
      needsRedraw = true;
    }

    if (params) {
      if(params[0].start === 0 || params[0].START === 0)
      needsRedraw = true;
    }

    if (this.editRowArray !== editRowArray) {
      this.editRowArray = editRowArray;
      needsRedraw = true;
    }

    if (this.editRow !== editRow || this.editErrors !== editErrors) {
      this.editRow = editRow;
      this.editErrors = editErrors;
      this.newRowPositionID = newRowPositionID;
      needsRedraw = true;
    }

    if (this.props.filter !== filter) {
      this.setFilters(filter);
      needsRedraw = true;
    }

    if (this.props.groups !== groups) {
      this.groups = groups || [];
      this.hasGroupColumn = groups.length > 0;
      needsRedraw = true;
    }

    if (this.props.data !== data && this.props.clearSelectionOnRefresh) {
      this.resetState();
    }

    if (this.props.data !== data || needsRedraw) {
      this.setData(data, needsRedraw);
    }

    // if (!this.currentFavoriteId && hasFavoriteConfig && gridFavorite.data.length > 0) {
    //   let defaultFavId = undefined;
    //   for (let i = 0; i < gridFavorite.data.length; i++) {
    //     const col = gridFavorite.data[i];
    //     if (col.defaultFavorite) {
    //       defaultFavId = col.id;
    //       break;
    //     }
    //   }
    //   if (defaultFavId) {
    //     this.onLoadGridFavorite(defaultFavId);
    //   }

    // }
  }

  componentWillUnmount() {
    // fix user-select:none for IE11 and shift-click selection
    if (this.gridContainer && this.disableSelection) {
      this.gridContainer.removeEventListener('selectstart', this.disableSelection);
    }
  }

  onStateChange() {
    if (this.props.onStateChange) {
      this.props.onStateChange({...this.state});
  }
}

setColumnAttribute(cols, dataKey, attr, value) {
  return cols.map(col => {
    if (col.dataKey === dataKey) {
      return {...col, [attr]: value};
      }
      return col;
    });
  }

resizeColumn = (newColumnWidth, dataKey) => {
  const {columns} = this.state;
  const newColumns = this.setColumnAttribute(columns, dataKey, 'width', newColumnWidth);
  this.setState({ columns: newColumns }, this.onStateChange);
}

setFixedColumns = (isFixed, columnNames) => {
  if (columnNames) {
    let newColumns = this.state.columns;
    columnNames.forEach((key) => {
      newColumns = this.setColumnAttribute(newColumns, key, 'fixed', isFixed);
    });
    this.setState({ columns: newColumns }, this.onStateChange);
  }
}

getColumnsFromProps = (props) => {
  const {columns = []} = props;
  const newColumns = columns.map((col, index) => {
    col.index = index;
    if (!col.width) {
      col.width = 70;
    }
    if (typeof col.sort === 'undefined') {
      col.sort = true;
    }
    if (typeof col.filter === 'undefined') {
      col.filter = true;
    }
    if (typeof col.menu === 'undefined') {
      col.menu = true;
    }
    // if (col.dataType === 'datetime' && typeof col.dateFormat === 'undefined') {
    //   col.dateFormat = 'datetime';
    // }
    return col;
  });
  return newColumns;
}

/**
 * Set the visible columns using the passed in array of dataKeys
 * to determine the order and visiblity of columns.
 *
 * @param {array<string>} colNameArray - array of dataKeys for the columns
 */
setVisibleColumns = (colNameArray = []) => {
  const newColumns = this.state.columns.map(item => {
    const {dataKey} = item;
    item.index = colNameArray.indexOf(dataKey);
    item.hidden = item.index === -1;
    return item;
  }).sort((a, b) => a.index - b.index);
  this.setState({ columns: newColumns }, this.onStateChange);
};

clickRow = (rowId) => {
  if (typeof rowId === 'undefined' || rowId === null) {
    this.clearClickedRows();
  } else {
    const rows = this.data.filter(dataRow => dataRow[ID] === rowId);
    if (rows.length > 0) {
      this.onRowClick(rows[0], null, {});
    }
  }
}

/**
 * Callback for fixed-data-table rowClick event. Clears the clicked
 * metadata attribute on the previous clicked row and sets the attribute
 * on the currently clicked row.
 *
 * Ths attribute controls the row highlight.
 *
 * @param  {row} row   the clicked rowData
 * @param  {number} index   row pos
 * @param {e} e the click event
 * @return {void}       no return
 */
onRowClick = (row, index, e) => {
  const {onRowClick} = this.props;
  if (onRowClick) {
    const newRow = {...row };
    onRowClick(newRow, e);
  }
  const id = row[ID];
  const rowstate = this.stateMap[id];
  const ctrlClickState = !rowstate.clicked;
  const ctrlKeyDown = e.ctrlKey || e.altKey; // use alt for mac

  if (!ctrlKeyDown) {
    this.clearClickedRows();
  }
  if (e.shiftKey) {
    return this.onRowShiftClick(row, index);
  }
  this.clicked = index;
  rowstate.clicked = ctrlKeyDown ? ctrlClickState : true;

  const clickedRows = this.getClickedRows();
  if (this.props.onClickedChange) {
    this.props.onClickedChange(clickedRows);
  }

  if (this.props.syncCheckbox) {
    this.checkRows(clickedRows);
  }

  this.commit();
}

onRowHover = (row, index, e) => {
	const {onRowHover} = this.props;

	this.clearHoveredRows();

	const id = row[ID];
	if(this.stateMap[id]) {
		this.stateMap[id].hovered = true;

		if (onRowHover) {
			const newRow = {...row};
			onRowHover(newRow);
		}

    //this.commit();
    this.forceUpdate();
	}
}

onRowHoverOut = (row, index, e) => {
	const {onRowHoverOut} = this.props;

	const id = row[ID];
	if(this.stateMap[id]) {
		this.stateMap[id].hovered = false;

		if (onRowHoverOut) {
			const newRow = {...row};
			onRowHoverOut(newRow);
		}

    //this.commit();
    this.forceUpdate();
	}
}

clearClickedRows = () => {
  const len = this.keyArray.length;
  for (let i = 0; i < len; i++) {
    this.stateMap[this.keyArray[i]].clicked = false;
  }
}

clearHoveredRows = () => {
  const len = this.keyArray.length;
  for (let i = 0; i < len; i++) {
    this.stateMap[this.keyArray[i]].hovered = false;
  }
}

onRowShiftClick = (row, index) => {
  if (this.clicked === index || this.clicked === undefined || this.clicked === null) {
    return;
  }

  const start = Math.min(index, this.clicked);
  const end = Math.max(index, this.clicked);
  for (let i = start; i <= end; i++) {
    const id = this.viewData[i][ID];
    this.stateMap[id].clicked = true;
  }

  const clickedRows = this.getClickedRows();
  if (this.props.onClickedChange) {
    this.props.onClickedChange(clickedRows);
  }

  if (this.props.syncCheckbox) {
    this.checkRows(clickedRows);
  }

  this.commit();
}

onRowCheck = (row, isSelected) => {
  const id = row[ID];
  this.checkRow(id, isSelected);
}

checkRow = (id, isSelected) => {
  this.stateMap[id].selected = isSelected;

  if (!this.checkIndependent) {
    if (this.alternateCheckBehavior) {
      if (isSelected) {
        this.selectChildRows(id, isSelected);
      }
    } else {
      this.selectChildRows(id, isSelected);
      // update parent row checked state
      let parentKey = this.parentMap[id];
      while (parentKey && parentKey !== ROOT) {
        if (!isSelected) {
          this.stateMap[parentKey].selected = isSelected;
        } else {
          const siblings = this.childMap[parentKey];
          let allSelected = true;
          for (let i = 0; i < siblings.length; i++) {
            const siblingRow = siblings[i];
            const siblingId = siblingRow[ID];
            if (!this.stateMap[siblingId].selected) {
              allSelected = false;
              break;
            }
          }
          if (allSelected) {
            this.stateMap[parentKey].selected = isSelected;
          }
        }
        parentKey = this.parentMap[parentKey];
      }
    }
  }

  const checkedRows = this.getCheckedRows();
  if (this.props.onCheckedChange) {
    this.props.onCheckedChange(checkedRows);
  }

  if (this.props.syncCheckbox) {
    this.clickRows(checkedRows);
  }

  this.commit();
}

checkAllRows = (isSelected) => {
  const len = this.keyArray.length;
  for (let i = 0; i < len; i++) {
    this.stateMap[this.keyArray[i]].selected = isSelected;
  }

  const checkedRows = this.getCheckedRows();
  if (this.props.onCheckedChange) {
    this.props.onCheckedChange(checkedRows);
  }

  if (this.props.syncCheckbox) {
    this.clickRows(checkedRows);
  }

  this.commit();
}

clickRows = (rowArray) => {
  const len = this.keyArray.length;
  for (let i = 0; i < len; i++) {
    this.stateMap[this.keyArray[i]].clicked = false;
  }

  if (rowArray && rowArray.length > 0) {
    const rowArrayLength = rowArray.length;
    for (let i = 0; i < rowArrayLength; i++) {
      this.stateMap[rowArray[i][ID]].clicked = true;
    }
  }
  if (this.props.onClickedChange) {
    this.props.onClickedChange(rowArray);
  }
}

checkRows = (rowArray) => {
  const len = this.keyArray.length;
  for (let i = 0; i < len; i++) {
    this.stateMap[this.keyArray[i]].selected = false;
  }

  if (rowArray && rowArray.length > 0) {
    const rowArrayLength = rowArray.length;
    for (let i = 0; i < rowArrayLength; i++) {
      this.stateMap[rowArray[i][ID]].selected = true;
    }
  }
  if (this.props.onCheckedChange) {
    this.props.onCheckedChange(rowArray);
  }
}

expandRow = (rowId, isExpanded) => {
  const rows = this.data.filter(row => row[ID] === rowId);
  if (rows.length > 0) {
    this.onRowExpand(rows[0], isExpanded);
  }
}

onRowExpand = (row, isExpanded, e) => {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
  const id = row[ID];
  this.stateMap[id].expanded = isExpanded;
  if (this.props.onRowExpand) {
    this.props.onRowExpand(row, isExpanded);
  }
  this.commit();
}

setSort = (sortArray) => {
  if (sortArray) {
    this.sort = sortArray;
    if (this.props.onSortFilter) {
      return this.props.onSortFilter(sortArray, this.filter, this.conjunction);
    }
    this.sortFunction = this.dynamicSortMultiple(sortArray);
    if (this.data) {
      this.commit(true);
    }
  }
}

allItemsSelected = () => {
  if (this.viewData.length === 0) {
    return false;
  }
  const checkboxDisabled = this.props.checkboxDisabled;
  return this.viewData.every((x) => {
    return x[ROW_STATE].selected || (checkboxDisabled && checkboxDisabled(x));
  });
}

selectChildRows = (id, isSelected) => {
  const childRows = this.childMap[id];
  if (childRows) {
    childRows.forEach((row) => {
      const childId = row[ID];
      this.stateMap[childId].selected = isSelected;
      this.selectChildRows(childId, isSelected);
    });
  }
}

expandAllRows = (isExpanded) => {
  this.expandRowLevel(isExpanded, isExpanded ? 10 : 0);
}

expandRowLevel = (isExpanded, level) => {
  const keys = Object.keys(this.childMap);
  for (let i = 0; i < keys.length; i++) {
    const state = this.stateMap[keys[i]];
    if (state) {
      const levelMatch = isExpanded ? state.level <= level : state.level >= level;
      if (levelMatch) {
        state.expanded = isExpanded;
      }
    }
  }
  if (!isExpanded) {
    this.updateRowCount();
  }
  this.commit();
}

// configureCheckBehavior = (behavior) => {
//   switch (behavior) {
//     case ALTERNATE_CHECK_BEHAVIOR:
//       this.alternateCheckBehavior = true;
//       this.checkIndependent = false;
//       break;
//     case CHECK_INDEPENDENT:
//       this.alternateCheckBehavior = false;
//       this.checkIndependent = true;
//       break;
//     default:
//       this.alternateCheckBehavior = false;
//       this.checkIndependent = false;
//       break;
//   }
//   this.hasCheckbox = true;
// }

setData = (data, needsRedraw) => {
  const {scrollLimit, limit, params} = this.props;
  if((scrollLimit > 0 || limit > 0) && this.data && this.data.length > 0 && !needsRedraw) {
      this.originalData = this.data.concat(data);
	} else if((scrollLimit > 0 || limit > 0) && (params[0].start === 0 || params[0].START === 0)){
    this.originalData = data || [];
  } else if(scrollLimit === undefined && limit === undefined) {
    this.originalData = data || [];
  }

  this.applyFiltersAndGroups();
}

processGroupData = () => {
  this.childMap = this.data.reduce((obj, row) => {
    let parentKey = row[this.PARENT_ID];
    if (typeof parentKey === 'undefined' || parentKey === null) {
      parentKey = ROOT;
      row[this.PARENT_ID] = ROOT;
    }
    let key = row[ID];
    if (typeof key === 'undefined') {
      key = row[ID] = row[this.keyFieldName];
    }
    this.parentMap[key] = parentKey;
    const children = obj[parentKey] || [];
    children.push(row);
    obj[parentKey] = children;
    return obj;
  }, {});
  this.data.forEach((row) => {
    const id = row[ID];
    const level = this.getLevel(id);
    let groupLabel;
    if (this.groups && level < this.groups.length) {
      groupLabel = this.groups[level].label;
    }
    this.keyArray.push(id);
    const state = this.stateMap[id];
    const hasLoadedChildren = this.childMap.hasOwnProperty(id);
    const hasChildren = hasLoadedChildren || row[this.hasChildrenFieldName];
    let expanded = state && state.expanded && hasLoadedChildren;
    if (this.props.defaultExpansionLevel && !expanded) {
      expanded = hasChildren && (level < this.props.defaultExpansionLevel);
    }
    const clicked = state && state.clicked;
    const selected = state && state.selected;
    const hovered = state && state.hovered

    this.stateMap[id] = {
      level,
      group: groupLabel,
      expanded,
      clicked,
      selected,
      hovered,
      hasChildren
    };
  });
}

processFlatData = () => {
  this.data.forEach((x, i) => {
    let id = x[this.keyFieldName];
    if (typeof id === 'undefined') {
      id = i;
    }
    x[ID] = id;
    this.keyArray.push(id);
    const state = this.stateMap[id];
    const clicked = state && state.clicked;
    const selected = state && state.selected;
    const hovered = state && state.hovered;
    this.stateMap[id] = { level: 0, clicked, selected, hovered };
  });
  this.childMap[ROOT] = this.data;
}

commit = (applySort) => {
  if (applySort && !this.props.onSortFilter) {
    this.applyCurrentSort();
  }
  this.updateViewRange();
}

getViewDataRange = (key, result) => {
  const root = this.childMap[key];
  if (!root) {
    return result;
  }
  const len = root.length;
  let row;
  let id;
  let rowstate;
  for (let i = 0; i < len; i++) {
    row = root[i];
    id = row[ID];
    rowstate = this.stateMap[id];
    if (result.count >= this.rangeStart && result.count < this.rangeEnd) {
      result.data[result.count] = Object.assign({}, row, { __state__: rowstate });
    }
    result.count++;
    if (rowstate.expanded) {
      this.getViewDataRange(id, result);
    }
  }
  return result;
}

updateViewRange = () => {
  const a = this.requestedRow;
  this.rangeEnd = Math.min(this.data.length, a + CHUNK);
  this.rangeStart = Math.max(0, this.rangeEnd - (2 * CHUNK));
  // this.rangeEnd=this.data.length
  // this.rangeStart=0
  const result = this.getViewDataRange(ROOT, { data: [], count: 0 });
  this.insertEditRows(result);
  this.viewData = result.data;
  this.rowCount = result.count;
  this.setState({
    sort: this.sort,
    rowCount: this.rowCount,
    filter: this.filter
  }, this.onStateChange);
  this.forceUpdate();
}

insertEditRows = (result) => {
  let {editRowArray = []} = this;
  if (editRowArray.length === 0 && this.editRow) {
    editRowArray = [
      {
        editRow: this.editRow,
        editErrors: this.editErrors,
        newRowPositionID: this.newRowPositionID
      }];
  }
  if (editRowArray.length > 0) {
    const newRows = [];
    const existingRows = [];

    const {data} = result;
    let counter = 0;
    editRowArray.forEach(row => {
      const {editRow} = row;
      if (typeof editRow[ID] === 'undefined') {
        newRows.push({...row, editIndex: counter++});
  } else {
    existingRows.push({...row, editIndex: counter++});
}
      });

existingRows.forEach(row => {
  const {editRow, editErrors, editIndex} = row;
  const id = editRow[ID];
  for (let i = 0; i < data.length; i++) {
    const dataRow = data[i];
    if (dataRow[ID] === id) {
      const rowState = {...dataRow[ROW_STATE], editErrors, editIndex, edit: true};
data[i] = {...dataRow, ...editRow, [ROW_STATE]: rowState };
break;
          }
        }
      });

newRows.forEach(row => {
  const {editRow, editErrors, newRowPositionID, editIndex} = row;
  const rowState = {
          ...this.emptyRow[ROW_STATE],
  edit: true,
  editErrors,
  editIndex
        };
const insertRow = {
          ...this.emptyRow,
          ...editRow,
  [ROW_STATE]: rowState};
if (newRowPositionID) {
  let pos = 0;
  for (let j = 0; j < data.length; j++) {
    if (data[j][ID] === newRowPositionID) {
      pos = j + 1;
      break;
    }
  }
  data.splice(pos, 0, insertRow);
} else {
  data.unshift(insertRow);
}
result.count++;
      });
    }
  }

rowGetter = (rowIndex) => {
  this.requestedRow = rowIndex;
  this.checkRange();
  return this.viewData[rowIndex] || this.emptyRow;
}

checkRange = () => {
  const a = this.requestedRow;
  const lower = Math.max(0, a - PADDING);
  const upper = Math.min(this.data.length, a + PADDING);
  if (lower < this.rangeStart || upper > this.rangeEnd) {
    this.updateViewRange();
  }
}

calcRowCount = (key, result) => {
  const root = this.childMap[key];
  if (!root) {
    return result;
  }
  const len = root.length;
  let row;
  let id;
  let rowstate;
  for (let i = 0; i < len; i++) {
    row = root[i];
    id = row[ID];
    rowstate = this.stateMap[id];
    result.count++;
    if (rowstate.expanded) {
      this.calcRowCount(id, result);
    }
  }
  return result;
}

updateRowCount = () => {
  if (!this.childMap[ROOT]) {
    return;
  }
  const result = this.calcRowCount(ROOT, { count: 0 });
  this.rowCount = result.count;
  if (this.requestedRow > this.rowCount) {
    this.requestedRow = this.rowCount - 1;
  }
}

setGroups = (groupConfigArray) => {
  this.groups = groupConfigArray || [];
  this.hasGroupColumn = this.groups.length > 0;
  if (this.data) {
    this.applyFiltersAndGroups();
  }
}

applyGroups = () => {
  if (this.groups.length > 0) {
    const sortArray = this.groups.reduce((a, b) => {
      const sort = { sort: b.dataKey, asc: true };
      return a.concat(sort);
    }, []);
    this.groupSortFunction = this.dynamicSortMultiple(sortArray);
    this.data.sort(this.groupSortFunction);

    const gArray = [];
    let keyArray;
    let stringKey;

    // generate keys
    for (let i = 0; i < this.data.length; i++) {
      const row = this.data[i];
      let id = row[this.keyFieldName];
      if (typeof id === 'undefined') {
        id = i;
      }
      row[ID] = id;
      const newKeyArray = this.compareGroupKeys(row, keyArray);
      if (keyArray !== newKeyArray) {
        keyArray = newKeyArray;
        gArray.push(keyArray);
        stringKey = keyArray.join('>');
      }
      row[this.PARENT_ID] = stringKey;
    }

    // add parent rows
    let groupValueKey;
    for (let i = 0; i < this.state.columns.length; i++) {
      const col = this.state.columns[i];
      if (!col.hidden) {
        groupValueKey = col.dataKey;
        break;
      }
    }
    const rowKeys = {};

    gArray.forEach((arr) => {
      let key;
      let labelKey;
      let parentKey;
      let row;
      while (arr.length > 0) {
        key = arr.join('>');
        if (!rowKeys[key]) {
          rowKeys[key] = true;
          labelKey = arr.pop();
          parentKey = arr.length > 0 ? arr.join('>') : ROOT;
          row = {};
          row[ID] = key;
          row[groupValueKey] = labelKey;
          row[this.PARENT_ID] = parentKey;
          this.data.push(row);
        } else {
          break;
        }
      }
    });
  }
}

compareGroupKeys = (obj, keyArray) => {
  if (!keyArray) {
    return this.extractGroupValues(obj);
  }
  for (let i = 0; i < this.groups.length; i++) {
    const val = obj[this.groups[i].dataKey];
    if (val !== keyArray[i]) {
      return this.extractGroupValues(obj);
    }
  }
  return keyArray;
}

extractGroupValues = (obj) => {
  const key = [];
  this.groups.forEach((x) => {
    key.push(obj[x.dataKey]);
  });
  return key;
}

getDataType = (dataKey) => {
  const {columns} = this.state;
  let col;
  for (let i = 0; i < columns.length; i++) {
    col = columns[i];
    if (col.dataKey === dataKey) {
      return col.dataType;
    }
  }
  return null;
}

setFilters = (filterConfigArray = []) => {
  if (this.props.onSortFilter && this.props.pageSize &&
    !isEqual(filterConfigArray, this.filter)) {
    this.filter = filterConfigArray;
    return this.props.onSortFilter(this.sort, this.filter, this.conjunction);
  }

  this.filter = filterConfigArray;
  if (filterConfigArray && filterConfigArray.length > 0) {
    this.filterFunction = filterConfigArray.reduce((a, b) => {
      if (!b.dataType) {
        b.dataType = this.getDataType(b.dataKey);
      }
      const filter = new Filter(b);
      const func = filter.getFilterFunction();
      a.push(func);
      return a;
    }, []);
  } else {
    this.filterFunction = [];
  }
}

getFilteredChildren = (row, filterFunction) => {
  const children = this.childMap[row[ID]] || [];
  const filteredChildren = [];
  for (let i = 0; i < children.length; i++) {
    const childRow = children[i];
    const childArray = this.getFilteredChildren(childRow, filterFunction);
    filteredChildren.push(...childArray);
  }
  if (filteredChildren.length > 0) {
    const rowState = this.stateMap[row[ID]];
    if (rowState) {
      rowState.expanded = true;
    }
  }

  if (filteredChildren.length > 0 || filterFunction(row)) {
    filteredChildren.push(row);
  }
  return filteredChildren;
}

applyFiltersAndGroups = () => {
  this.data = this.originalData.slice();
  const {pageSize, scrollLimit, limit} = this.props;
  if (!(pageSize > 0) && !(scrollLimit > 0) && !(limit > 0)) {
    const filters = this.filterFunction;
    if (filters && filters.length > 0) {
      let filterFunction = null;
      if (this.conjunction === 'OR') {
        filterFunction = (a) => {
          let result = false;
          for (let i = 0; i < filters.length; i++) {
            if (filters[i](a)) {
              result = true;
              break;
            }
          }
          return result;
        };
      } else {
        filterFunction = (a) => {
          let result = true;
          for (let i = 0; i < filters.length; i++) {
            if (!filters[i](a)) {
              result = false;
              break;
            }
          }
          return result;
        };
      }
      // include parent of any child orphaned by filtering
      if (this.serverDefinedGrouping) {
        // have to process groups before we can filter
        this.processGroupData();
        const filteredData = [];
        const len = this.data.length;
        let row;
        for (let i = 0; i < len; i++) {
          row = this.data[i];
          if (row[this.PARENT_ID] === ROOT) {  // is root row
            if (this.childMap.hasOwnProperty(row[ID])) { // has children
              const children = this.getFilteredChildren(row, filterFunction);
              if (children.length > 0) {
                const rowState = this.stateMap[row[ID]];
                if (rowState) {
                  rowState.expanded = true;
                }
              }
              filteredData.push(...children);
            } else { // root with no children
              if (filterFunction(row)) {
                filteredData.push(row);
              }
            }
          }
        }
        this.data = filteredData;
      } else {
        this.data = this.data.filter(filterFunction);
      }
    }
  }
  this.applyGroups();
  if (this.hasGroupColumn) {
    this.processGroupData();
  } else {
    this.processFlatData();
  }
  this.updateRowCount();
  this.commit(true);
}

applyCurrentSort = () => {
  if (this.sort && this.sort.length > 0) {
    const keys = Object.keys(this.childMap);
    keys.forEach(key => {
      this.childMap[key].sort(this.sortFunction);
    });
  }
}

getLevel = (id) => {
  let level = 0;
  let parentId = this.parentMap[id];
  while (parentId != null && parentId !== ROOT) {
    level++;
    parentId = this.parentMap[parentId];
  }
  return level;
}

getCheckedKeys = () => {
  return Object.keys(this.stateMap).reduce((acc, id) => {
    return this.stateMap[id].selected ? acc.concat(id) : acc;
  }, []).join(',');
}

getCheckedRows = () => {
  return this.data.filter((row) => {
    return this.stateMap[row[ID]].selected;
  });
}

getClickedKeys = () => {
  return Object.keys(this.stateMap).reduce((acc, id) => {
    return this.stateMap[id].clicked ? acc.concat(id) : acc;
  }, []).join(',');
}

getClickedRows = () => {
  return this.data.filter((row) => {
    return this.stateMap[row[ID]].clicked;
  });
}

// TODO: use localeCompare for strings to enable i18n sorting.
// also check out stable sort algorithm since Chrome array sort
// is not stable
getSortFunction = (sortObj) => {
  const property = sortObj.sort;
  const sortOrder = sortObj.asc ? 1 : -1;
  return (first, second) => {
    const {[property]: val1 = null} = first;
    const {[property]: val2 = null} = second;
    let result;
    if (val1 === null) {
      result = -1;
    } else if (val2 === null) {
      result = 1;
    } else {
      result = (val1 < val2) ? -1 : (val1 > val2) ? 1 : 0;
    }
    return result * sortOrder;
  };
}

dynamicSortMultiple = (sortArray) => {
  const props = sortArray;
  return (obj1, obj2) => {
    const numberOfProperties = props.length;
    let count = 0;
    let result = 0;
    while (result === 0 && count < numberOfProperties) {
      result = this.getSortFunction(props[count])(obj1, obj2);
      count++;
    }
    return result;
  };
}

preventPropagation = (e) => {
  e.stopPropagation();
}

showOptions = (optionsTabIndex) => {
  this.setState({ showOptions: true, option: optionsTabIndex });
}

// showFavorite = () => {
//   this.setState({ showFavorite: true });
// }

// onFavoriteHide = () => {
//   this.setState({ showFavorite: false });
// }

// setCurrentFavId = (id) => {
//   this.currentFavoriteId = id;
// }

onOptionsHide = (gridState) => {
  //pagesize need to be replaced by limit
  if (gridState) {
      const {filter, sort, conjunction} = gridState;
      const {pageSize, onSortFilter} = this.props;
      this.conjunction = conjunction;
      this.setState({
        columns: this.getColumnsFromProps(gridState),
        showOptions: false
      }, this.onStateChange);
      if (pageSize > 0 && onSortFilter) {
        this.sort = sort;
        this.filter = filter;
        this.setState({ sort, filter }, this.onStateChange);
        onSortFilter(sort, filter, conjunction);
      } else {
        this.setSort(sort);
        this.setFilters(filter);
        this.applyFiltersAndGroups();
      }
      if (this.props.onApplyConfigDialog) {
        this.props.onApplyConfigDialog({...gridState});
      }
  } else {
    this.setState({ showOptions: false });
  }
}

// onLoadGridFavorite = (id) => {
//   const {gridFavorite} = this.props;
//   const OriFavConfig = gridFavorite.data.filter(fav => fav.id === id);
//   if (OriFavConfig.length === 1) {
//       const favConfig = {
//           ...OriFavConfig[0],
//           columns: eval('(' + OriFavConfig[0].columns + ')'),
//         filter: eval('(' + OriFavConfig[0].filter + ')'),
//           sort: eval('(' + OriFavConfig[0].sort + ')'),
//             showOptions: OriFavConfig[0].showOptions ? true : false
//   }

//   this.onOptionsHide(favConfig);
// }

//   }

clearSort = () => {
  this.onOptionsHide({ columns: this.state.columns, sort: [], filter: this.filter });
}

clearFilter = () => {
  this.onOptionsHide({ columns: this.state.columns, sort: this.sort, filter: [] });
}

onCheckItem = (rowData, e) => {
  const selected = e.target.checked;
  this.onRowCheck(rowData, selected);
}

resetState = () => {
  this.keyArray.forEach(key => {
    this.stateMap[key] = {};
  });
  if (this.props.onCheckedChange) {
    this.props.onCheckedChange([]);
  }
  if (this.props.onClickedChange) {
    this.props.onClickedChange([]);
  }
}

groupCellRenderer = (props) => {
	const {groupIndent, enableTextSelection} = this.props;
	const {row} = props;
	return (
		<AccordionCell row={row} onRowExpand={this.onRowExpand} />
	)
}

groupHeaderRenderer = () => {
    return (
				<div className='dataGridCustomCellWrapper' style={{ textAlign: 'center' }}></div>
        );
}

priorityRenderer = (props) => {
	const {row, isEdit} = props;
	const state = row[ROW_STATE];
	const level = state.level;
	const {priorityType} = row;

	if(level > 0) {
		return <div className="dataGridCell" />;
	}

	let icon = null;
	switch (priorityType) {
		case "high": icon = (<Icon size="21" name="alert-circle" color="#B91224" />);
		break;
		case "medium": icon = (<Icon size="21" name="alert-triangle" color="#FFBC06" />);
		break;
		default: icon = null;
		break;
	}
	return (
		<div className="dataGridCustomCellWrapper" style={{padding: "0 15px 0 0"}}>
			{icon}
		</div>
	);
}

priorityHeaderRenderer = () => {
 return (
	<div className='dataGridPriorityHeader'>
		<Icon size="22" name="flag" />
	</div>
 );
}

checkboxRenderer = (props) => {
  const {row, isEdit} = props;
  const {noChildCheckbox} = this.props;
  const state = row[ROW_STATE];
  const level = state.level;
  const disabled = this.props.checkboxDisabled ? this.props.checkboxDisabled(row) : false;
  const checked = !!state.selected && !disabled;

  if (noChildCheckbox && level > 0) {
    return <div className="dataGridCell" />;
  }
  return (
    <div className="dataGridCustomCellWrapper" onClick={this.preventPropagation} style={{height:15,margin:'auto'}}>
      <Checkbox
        checked={checked}
        size="small"
        disabled={isEdit || disabled}
        onClick={this.preventPropagation}
        onChange={this.onCheckItem.bind(null, row)}
      />
    </div>
  );
}

checkboxHeaderRenderer = () => {
  const allItemsSelected = this.allItemsSelected();
  return (
    <div className='dataGridCheckboxHeader' style={{position:'relative', bottom: 4, width: 20, height: 20}}>
      <Checkbox
        name="dataGridCheckboxHeader"
        size="small"
        checked={allItemsSelected}
        onClick={this.checkboxHeaderOnClick}
      />
    </div>
  );
}

checkboxHeaderOnClick = (e) => {
  //e.stopPropagation();
  const checked = e.target.checked;
  this.checkAllRows(checked);
}

//onHeaderMenuClick = () => {
//	const {onHeaderMenuClick} = this.props;
//	if(onHeaderMenuClick) {
//		onHeaderMenuClick(...this.state);
//	}
//}

render() {
  const {rowCount, sort, columns, showOptions, option, showFavorite} = this.state;
  const {height, width, stripe, isLoading, hasCheckbox, hasPriority, params,
    hasFooter, totalCount, startRow, pageSize, showPage, scale, groupIndent,
    onClientRefresh, noDataMessage, headerHeight, onRowDoubleClick, dragDisabled,
    hasHeader, prefix, onExportExcel, onExportPdf, onExportCsv, rowHeight,
    getRowStyle, hasConfigDialog, enableTextSelection, hasHoverAction, rowActionMenu,
    clearSelectionOnRefresh, autoColumnWidth, hasFavoriteConfig, gridFavorite, gridFavoriteActions,
    hasTitle, title, hasOverflowMenu, overflowMenu, data, scrollLimit, actions, limit, refresh, headerMenuItems, onHeaderMenuClick, dataGridType
  } = this.props;

  const gridColumns = columns.filter(col => !col.hidden);
  if(hasPriority) {
    gridColumns.unshift({
      width: 35,
      dataKey: 'priorityType',
      dataType: 'string',
      locked: true,
      align: 'center',
      fixed: true,
      sort: true,
      cell: this.priorityRenderer,
      header: this.priorityHeaderRenderer
     });
  }

  if (hasCheckbox) {
    gridColumns.unshift({
      width: 45,
      dataKey: '__selected__',
      locked: true,
      align: 'center',
      fixed: true,
      cell: this.checkboxRenderer,
      header: this.checkboxHeaderRenderer
    });
  }

  if(this.hasGroupColumn) {
    gridColumns.unshift({
      width: 30,
      dataKey: '__group__',
      locked: true,
      align: 'center',
      fixed: true,
      cell: this.groupCellRenderer,
      header: this.groupHeaderRenderer
    });
  }

  const gridActions = {
    onColumnResize: this.resizeColumn,
    setFixedColumns: this.setFixedColumns,
    setVisibleColumns: this.setVisibleColumns,
    onRowCheck: this.onRowCheck,
    onRowClick: this.onRowClick,
    onRowHover: this.onRowHover,
    onRowHoverOut: this.onRowHoverOut,
    onRowDoubleClick,
    onRowShiftClick: this.onRowShiftClick,
    onRowCheckAll: this.checkAllRows,
    onRowExpand: this.onRowExpand,
    onSort: this.setSort,
    setFilters: this.setFilters,
    setGroups: this.setGroups,
    onDragDrop: this.props.onDragDrop,
    onChange: this.props.onChange,
    getSelectedRows: this.getCheckedRows,
    getClickedRows: this.getClickedRows,
    onExportCsv,
    onExportExcel,
    onExportPdf,
    getRowStyle,
    resetState: this.resetState
  };

  const sizeMultiplier = scaleMultiplier[scale];
  const scaledRowHeight = !isNaN(rowHeight) ? rowHeight * sizeMultiplier : rowHeight;
  const scaledHeaderHeight = headerHeight * sizeMultiplier;
  const fontScale = sizeMultiplier === 1 ? sizeMultiplier : sizeMultiplier + 0.15;
  const bodyStyle = { fontSize: `${fontScale}em`, lineHeight: '1.5em' };
  //const scaledStyleClass = scale < 2 || rowHeight < 35 ? 'tinyStyleClass' : '';
  const titleBarHeight = hasTitle ? 50 : 0;
  const titleBar = hasTitle ? (
    <TitleBar
		width={width}
		title={title}
		height={titleBarHeight}
		hasOverflowMenu={hasOverflowMenu}
		overflowMenu={overflowMenu}
    params={params}
    refresh={refresh}
		onClientRefresh={onClientRefresh}
    gridActions={gridActions}
    columns={columns}
    clearSelectionOnRefresh={clearSelectionOnRefresh}
    />
  ) : undefined;

  return (
    <div className="design2DataGrid">
      {titleBar}
      <div style={bodyStyle} className={prefix} ref={(c) => { this.gridContainer = c; }}>
        <TableBody
          data={this.data}
          rowGetter={this.rowGetter}
          rowCount={rowCount}
          height={height - titleBarHeight}
          width={width}
          oriColumns={columns}
          columns={gridColumns}
          rowHeight={scaledRowHeight}
          headerHeight={scaledHeaderHeight}
          hasHeader={hasHeader}
          gridActions={gridActions}
          sort={sort}
          groups={this.groups}
          stripe={stripe}
          hasCheckbox={hasCheckbox}
          hasGroupColumn={this.hasGroupColumn}
          noDataMessage={noDataMessage}
          isLoading={isLoading}
          pageSize={pageSize}
          dragDisabled={dragDisabled}
          groupIndent={groupIndent}
          enableTextSelection={enableTextSelection}
          autoColumnWidth={autoColumnWidth}
          hasHoverAction={hasHoverAction}
          rowActionMenu={rowActionMenu}
          showPage={showPage}
          limit={limit}
          scrollLimit={scrollLimit}
          headerMenuItems={headerMenuItems}
          onHeaderMenuClick={onHeaderMenuClick}
          dataGridType={dataGridType}
          params={params}
        />
      </div>
    </div>
  );
}
}
