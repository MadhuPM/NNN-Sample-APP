import PropTypes from 'prop-types'

export const DataGridPropTypes = {
  keyFieldName: PropTypes.string.isRequired,
  parentFieldName: PropTypes.string,
  // array of objects for your grid
  data: PropTypes.any,
  // columns definition is required
  columns: PropTypes.arrayOf(PropTypes.shape({
    dataKey: PropTypes.string.isRequired,
    isKey: PropTypes.bool,
    isParentKey: PropTypes.bool,
    index: PropTypes.number,
    label: PropTypes.any,
    width: PropTypes.any,
    align: PropTypes.oneOf(['left', 'right', 'center']),
    fixed: PropTypes.bool,
    group: PropTypes.bool,
    sort: PropTypes.bool,
    filter: PropTypes.bool,
    locked: PropTypes.bool,
    edit: PropTypes.bool,
    hideForExport: PropTypes.bool,
    dataType: PropTypes.oneOf(['date', 'datetime', 'string', 'number']).isRequired,
    dateFormat: PropTypes.string,
    format: PropTypes.string,
    numberFormat: PropTypes.oneOf([
      'percentage',
      'currency',
      'rate',
      'integer',
      'id'
    ]),
    hidden: PropTypes.bool,
    cell: PropTypes.func,
    header: PropTypes.func,
    editor: PropTypes.any,
    filterEditor: PropTypes.any,
    menu: PropTypes.bool
  })).isRequired,
  // whether to show checkbox for row selection
  hasCheckbox: PropTypes.bool,
  // sync behavior of checkbox and row selection
  syncCheckbox: PropTypes.bool,
  // parent checkbox does not control child items
  checkIndependent: PropTypes.bool,
  params: PropTypes.any,
  // whether to show priority column
  hasPriority: PropTypes.bool,
  // whether to show overflow in the hovered row
  hasHoverAction: PropTypes.bool,
  // editable grid props
  editRow: PropTypes.object,
  // id of row to place new row after
  newRowPositionID: PropTypes.any,
  // keyed object container edit error messages
  editErrors: PropTypes.object,
  // use for multi-row edit grid
  editRowArray: PropTypes.arrayOf(PropTypes.shape({
    newRowPositionID: PropTypes.any,
    editRow: PropTypes.object,
    editErrors: PropTypes.object
  })),
  // onChange callback for row editing
  onChange: PropTypes.func,
  // sets type size - set this to 2 by default
  scale: PropTypes.oneOf([0, 1, 2]),
  defaultExpansionLevel: PropTypes.number,
  // pass in sort params
  sort: PropTypes.array,
  // pass in func to sort/filter on server instead of client
  onSortFilter: PropTypes.func,
  // pass in filter params
  filter: PropTypes.array,
  // pass in filter conjunction
  conjunction: PropTypes.oneOf(['AND', 'OR']),
  // pass in group params
  groups: PropTypes.array,
  // pass this number in if paginating on server
  totalCount: PropTypes.number,
  // for server-side pagination
  pageSize: PropTypes.number,
  startRow: PropTypes.number,
  // have to pass in this function for server pagination
  showPage: PropTypes.func,
  // function to call when refreshing grid (if using server pagination)
  refresh: PropTypes.func,
  // show loading indicator
  isLoading: PropTypes.bool,
  // display footer
  hasFooter: PropTypes.bool,
  // display header
  hasHeader: PropTypes.bool,
  //dispaly overflow menu on title bar
  hasOverflowMenu: PropTypes.bool,
  overflowMenu: PropTypes.array,
  //display Title
  hasTitle: PropTypes.bool,
  title: PropTypes.string,
  // leave blank unless you have a custom header
  headerHeight: PropTypes.number,
  // change default row height
  rowHeight: PropTypes.oneOfType([PropTypes.func, PropTypes.number]),
  calcHeight: PropTypes.func,
  // alternate row color
  stripe: PropTypes.bool,
  // handled by autoresize wrapper
  width: PropTypes.number,
  height: PropTypes.number,
  // callbacks
  onStateChange: PropTypes.func,
  onClickedChange: PropTypes.func,
  onCheckedChange: PropTypes.func,
  onDragDrop: PropTypes.func,
  onHeaderMenuClick: PropTypes.func,
  // pass function to handle clicked row
  onRowClick: PropTypes.func,
  // pass function to handle double-clicked row
  onRowDoubleClick: PropTypes.func,
  onRowExpand: PropTypes.func,
  getRowStyle: PropTypes.func,
  onExportExcel: PropTypes.func,
  onExportCsv: PropTypes.func,
  onExportPdf: PropTypes.func,
  noDataMessage: PropTypes.string,
  prefix: PropTypes.string,
  // diable drag/drop column headers
  dragDisabled: PropTypes.bool,
  // callback for Apply button in config dialog
  onApplyConfigDialog: PropTypes.func,
  // modify indent for grouping levels
  groupIndent: PropTypes.number,
  // row field containing 1 or 0 indicating whether row can expand
  hasChildrenFieldName: PropTypes.string,
  // disable checkbox selection for child rows
  noChildCheckbox: PropTypes.bool,
  hasConfigDialog: PropTypes.bool,
  disableCheckbox: PropTypes.func,
  enableTextSelection: PropTypes.bool,
  clearSelectionOnRefresh: PropTypes.bool,
  autoColumnWidth: PropTypes.bool,
  scrollLimit: PropTypes.number,
  headerMenuItems: PropTypes.array
};
