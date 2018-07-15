import React, {Component} from 'react';
import PropTypes from 'prop-types'
import ReactDOM from 'react-dom';
import Menu, {SubMenu, MenuItem} from '../Menu';

export default class Header extends Component {
  static propTypes = {
    sort: PropTypes.array,
    gridActions: PropTypes.objectOf(PropTypes.func),
    col: PropTypes.object,
    groups: PropTypes.arrayOf(PropTypes.object),
    pageSize: PropTypes.number,
    wrap: PropTypes.bool,
    oriColumns:PropTypes.any
  };

  constructor(props) {
    super(props);
    const {groups, cols} = props;
    const columnKeys = cols.map(item => item.dataKey);
    this.setGroups(groups);
    this.state = { show: false, columnKeys: columnKeys};
  }

  componentWillReceiveProps(newProps) {
    const {groups, cols} = newProps;
    const columnKeys = cols.map(item => item.dataKey);
    this.setGroups(groups);
    this.setState({ columnKeys: columnKeys });
  }

  setGroups(groups = []) {
    this.groupMap = groups.reduce((map, group) => {
      map[group.dataKey] = group;
      return map;
    }, {});
  }

  freeze = () => {
    const {col, gridActions} = this.props;
    this.setState({ show: false });
    gridActions.setFixedColumns(!col.fixed, [col.dataKey]);
  }

  autoResize = () => {
    const {col, gridActions} = this.props;
    this.setState({ show: false });
    gridActions.autoResizeColumn(col);
  }

  group = () => {
    const {col, gridActions, groups} = this.props;
    this.setState({ show: false });
    let newGroups;
    if (this.groupMap.hasOwnProperty(col.dataKey)) {
      newGroups = groups.filter(group => group.dataKey !== col.dataKey);
    } else {
      groups.push({ dataKey: col.dataKey, label: col.label });
      newGroups = groups.slice();
    }
    gridActions.setGroups(newGroups);
  }

  clearGroups = () => {
    this.setState({ show: false });
    this.props.gridActions.setGroups([]);
  }

  selectMenu = (e) => {

  }

  selectColsMenu = (e) => {
    this.setState({ subMenuKeys: e.selectedKeys });
    const {gridActions} = this.props
    gridActions.setVisibleColumns(e.selectedKeys);

  }

  onHeaderClick = (dataKey) => {
      if (dataKey === "__selected__") return;
      const {show} = this.state
      show ? this.setState({show:false}):this.setState({show:true})
  }

  onHide = (e) => {
      this.setState({show: false});
  }

  onMenuSelect = (e) => {
    const {col, onHeaderMenuClick} = this.props;

    if(onHeaderMenuClick) {
      onHeaderMenuClick(e.key, col.dataKey);
    }
  }

  render() {
    const {col, sort, gridActions, pageSize, wrap, oriColumns, headerMenuItems} = this.props;
    const {columnKeys, show} = this.state
    const dataKey = col.dataKey;
    const sortConfig = sort && sort.length > 0 ? sort[0] : { sort: null, asc: false };
    const isCurrentSort = dataKey === sortConfig.sort;
    const sortClassName = (sortConfig.asc ? 'dataGridSort' : ' dataGridSortDesc');
    const sortIndicator = isCurrentSort ? <span className={sortClassName} /> : null;
    const asc = isCurrentSort ? !sortConfig.asc : true;
    const isCurrentGroup = this.groupMap.hasOwnProperty(dataKey);
    const groupMenuText = isCurrentGroup ? 'Ungroup' : 'Group';
    let customMenuItems = null;
    // only show grouping menu if not paginated
    const groupMenu = col.group && !pageSize ? (
      [<MenuItem key='groupMenu' onSelect={this.group}>{groupMenuText}</MenuItem>,
        <MenuItem key='clearGroupMenu' onSelect={this.clearGroups}>Clear All Groups</MenuItem>, <MenuItem  divider key="dividerMenu"/>]
    ) : null;

    const headerWrapStyle = wrap ? { whiteSpace: 'normal' } : {};
    const headerContent = col.header ? <col.header column={col} /> : col.label;
    const headerNode = (<div>{headerContent}{sortIndicator}</div>);
    const filteredCols = oriColumns.filter(item => !item.fixed );
    const columnsMenu = filteredCols.map((item) => {
      return <MenuItem key={item.dataKey} >{item.label}</MenuItem>
    });
    const headerClass = this.state.show ? "dataGridCellHeaderText dataGridHeaderSelected" : "dataGridCellHeaderText";
    const noMenuClass = "dataGridCellHeaderText dataGridCellHeaderNoMenu";
    if(!col.menu) return (
      <div className={noMenuClass} style={headerWrapStyle}  ref="headerNode">
        {headerContent}
      </div>
    );

    if(headerMenuItems) {
      customMenuItems = [];
      customMenuItems.push(<MenuItem key="customMenuDivider" divider />)
      customMenuItems.push(headerMenuItems)
    }

    return (
      <div className={headerClass} style={headerWrapStyle}
        onClick={this.onHeaderClick.bind(null, dataKey)} ref="headerNode"
      >
          {headerContent}
          {sortIndicator}
        <Menu onSelect={this.onMenuSelect} flexHeader target={() => ReactDOM.findDOMNode(this.refs.headerNode)} show={show} onHide={this.onHide}>
        <MenuItem key="sortAsc" onSelect={col.sort ? gridActions.onSort.bind(null, [{ sort: dataKey, asc: true }]) : null}>Sort Column A to Z</MenuItem>
        <MenuItem key="sortDec" onSelect={col.sort ? gridActions.onSort.bind(null, [{ sort: dataKey, asc: false }]) : null}>Sort Column Z to A</MenuItem>
        <MenuItem  divider />
            <MenuItem key="freezeMenu" onSelect={this.freeze}>{col.fixed ? 'Unfreeze' : 'Freeze'}</MenuItem>
            <MenuItem key="autoResizeMenu" onSelect={this.autoResize}>Auto-resize Column</MenuItem>
            <MenuItem  divider />
            <SubMenu multiple
              key='columnsConfig'
              onSelect={this.selectColsMenu}
              onDeselect={this.selectColsMenu}
              defaultSelectedKeys={columnKeys}
              title="Columns"
            >
              {columnsMenu}
            </SubMenu>
        {customMenuItems}
        </Menu>

      </div>
    );
  }

}
