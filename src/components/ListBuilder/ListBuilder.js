import React, {Component} from 'react';
import PropTypes from 'prop-types';
import DataGrid from './DraggableDatagrid';
import Button from '../Button'
import Icon, {ICONS} from '../Icon'
import Search from './Search'
import classNames from 'classnames'
import {VerticalLayout, HorizontalLayout, FlexPanel, FixedPanel} from '../Layout';
import DraggableCell from '../DataGrid/DraggableCell'
import {ButtonGroup, DropdownButton, MenuItem} from 'react-bootstrap';
import update from 'immutability-helper';

export default class ListBuilder extends Component {
  static propTypes = {
    options: PropTypes.array.isRequired,
    value: PropTypes.array,
    onChange: PropTypes.func.isRequired,
    height: PropTypes.number,
    valueKey:PropTypes.string,
    labelKey:PropTypes.string,
    defaultValue:PropTypes.array
  };
  static defaultProps = {
    titles: ['Source','Target'],
    labelKey:'label',
    valueKey:'value'
  }
  constructor(props) {
    super(props);
    this.leftSelected = [];
    this.rightSelected = [];
    let addState=this.getState(props)
    let rightData=props.value?props.value:props.defaultValue
    this.state = {
      leftSearch: false,
      rightSearch: false,
      leftFilter: null,
      rightFilter: null,
      leftSort: false,
      rightSort: false,
      leftSortState: null,
      rightSortState: null,
      update: false,
      rightData,
      controlled:false,
      ...addState
    };
  }
  
  
  componentWillReceiveProps(nextProps) {
    const props = this.getState(nextProps)
    if ('value' in nextProps) {
      props.rightData = nextProps.value || []
    }
    this.setState(props)
  }

  searchClick = (left, e) => {
    e.stopPropagation()
    left
      ? this.setState({leftSearch: true})
      : this.setState({rightSearch: true})
  }
  onSearch = (left, e) => {
    const {leftSearch, rightSearch} = this.state;
    const {labelKey}=this.props
    left
      ? this.setState({
        leftFilter: [
          {
            value: e.target.value,
            dataKey: labelKey,
            operator: "CONTAINS"
          }
        ]
      })
      : this.setState({
        rightFilter: [
          {
            value: e.target.value,
            dataKey: labelKey,
            operator: "CONTAINS"
          }
        ]
      })
  }
  onClose = (left, e) => {
    left
      ? this.setState({leftFilter: null, leftSearch: false})
      : this.setState({rightFilter: null, rightSearch: false})
  }
  sortToggle = (left, e) => {
    const {leftSort, rightSort,rightData} = this.state;
    const {labelKey}=this.props
    left
      ? this.setState({
        leftSort: !leftSort,
        leftSortState: [
          {
            sort: labelKey,
            asc: leftSort
          }
        ]
      })
      :rightData.length!==0? this.setState({
        rightSort: !rightSort,
        rightSortState: [
          {
            sort:labelKey,
            asc: rightSort
          }
        ]
      }):null
  }
  setHeader = (header, left) => {
    const {
      leftSearch,
      rightSearch,
      leftColConfig,
      rightColConfig,
      leftData,
      rightData,
      leftSort,
      rightSort
    } = this.state;
    let data = left
      ? leftData
      : rightData
    let sortState = left
      ? leftSort
      : rightSort
    let SortClass = classNames('sort-icon', {'sort-icon-asc': sortState})
    let headerCol = (<div
      className="list-builder-header"
      onClick={this
      .sortToggle
      .bind(this, left)}
                     >{`${header.column.label} (${data.length})`} 
      <Icon name={ICONS.REPLY} className={SortClass} thickness='1' size="10"/>
      <Button
        className="list-search-button"
        onClick={this
        .searchClick
        .bind(this, left)} disabled={data.length==0}
      ><Icon name={ICONS.SEARCH} size="20"/></Button>
    </div>)
    if ((left && leftSearch) || (!left && rightSearch)) {
      headerCol = (<Search
        onChange={this
        .onSearch
        .bind(this, left)}
        onClose={this
        .onClose
        .bind(this, left)}
        left={left}/>)
    }
    return headerCol
  }
  setCell = (row, left) => {
    const {labelKey} = this.props;
    let classname = classNames('dataGridCellText', {'disabledCell': row.disabled})
    return <div className={classname}>{row[labelKey]}</div>
  }
  getState(props) {
    const {options,labelKey,valueKey,titles,value,defaultValue} = props;
    let val=value?value:defaultValue
    let controlled=value?true:false
    if (titles.length==1) {
      titles[1]=titles[0]
    }
    let leftColConfig=[
      {
        dataKey: labelKey,
        label: titles[0],
        width: '*',
        dataType: 'string',
        menu: false,
        header: (header) => this.setHeader(header, true),
        cell: ({value, row}) => this.setCell(row, true)
      }
    ];
    let rightColConfig=[
      {
        dataKey: labelKey,
        label: titles[1],
        width: '*',
        dataType: 'string',
        menu: false,
        header: (header) => this.setHeader(header, false),
        cell: DraggableCell
      }
    ];
    let valList=val.map(item=>item[valueKey])
      let leftData=options.map(item=>{
        let newItem= Object.assign({}, item)
        if (valList.indexOf(newItem[valueKey]) !== -1) {
          newItem.disabled = true
        }
        return newItem
      })
      let rightData=options.filter(item=>{
        return valList.indexOf(item[valueKey]) !== -1
      })
    return {
      leftData,
      leftColConfig,
      rightColConfig,
      controlled
    }
  }

  moveRight = () => {
    let {leftData, rightData} = this.state;
    let {valueKey} = this.props;
    let leftSelected = this
      .leftSelected
      .map(item => item[valueKey])
    rightData = rightData.concat(this.leftSelected);
    let newData = leftData.map(item => {
      if (leftSelected.indexOf(item[valueKey]) !== -1) {
        item.disabled = true
      }
      return item
    });
    this.onDataChanged(rightData,newData)
    this.leftSelected = [];
  }

  moveLeft = () => {
    let {rightData, leftData, rightColConfig} = this.state;
    let {valueKey} = this.props;
    let rightSelected = this
      .rightSelected
      .map(item => item[valueKey])
    rightData = rightData.filter(item => rightSelected.indexOf(item[valueKey]) === -1);
    leftData = leftData.map(item => {
      if (rightSelected.indexOf(item[valueKey]) !== -1) {
        item.disabled = false
      }
      return item
    })
    this.onDataChanged(rightData,leftData)
    this.rightSelected = [];
  }

  leftSelectionChange = (colArray) => {
    let {update} = this.state;
    this.setState({
      update: !update
    })
    this.leftSelected = colArray
      .filter(item => !item.disabled)
      .map(item => Object.assign({}, item));
  }

  rightSelectionChange = (colArray) => {
    let {update} = this.state;
    this.setState({
      update: !update
    })
    this.rightSelected = colArray
      .filter(item => !item.disabled)
      .map(item => Object.assign({}, item));
  }

  onDragDrop = (dragIndex, hoverIndex) => {
    const row = this.state.rightData[dragIndex];
    const newState = update(this.state, {
      rightData: {
        $splice: [
          [dragIndex, 1],
          [hoverIndex, 0, row]
        ]
      }
    });
    this.onDataChanged(newState.rightData,newState.leftData)
  }

  onDataChanged = (rightData,leftData) => {
    const {onChange} = this.props;
    const {controlled} = this.state;
    onChange(rightData, leftData);
    if (controlled) {
      this.setState({leftData})
    }else{
      this.setState({rightData,leftData})
    }
  }

  onApply = () => {
    const {leftData, rightData} = this.state;
    return {leftData, rightData};
  }

  onFilter = (filter) => {
    if (filter) {
      this.setState({filter: [filter]});
    } else {
      this.setState({filter: undefined});
    }
  }
  checkboxDisabled = (row) => {
    return row.disabled
      ? true
      : false
  }
  onCrossDragDrop=(left)=>{
    left?this.moveRight():this.moveLeft()
  }
  render() {
    const {
      rightData,
      leftData,
      filter,
      leftSearch,
      rightSearch,
      leftFilter,
      rightFilter,
      leftSortState,
      rightSortState,
      leftColConfig,
      rightColConfig
    } = this.state;
    const {height,labelKey,valueKey,onChange,options,defaultValue,...props} = this.props;
    const layoutHeight = height && height > 280
      ? height
      : 280;
    const buttonTop = layoutHeight >= 350
      ? '33%'
      : '15%';
    let classname = classNames('cdt4-list-builder', {leftSearch, rightSearch})

    //   <FixedPanel style={{ overflow: 'visible' }}>   <Filter
    // config={leftColConfig} onFilter={this.onFilter} /> </FixedPanel>
    return (
      <div className={classname} {...props}>
        <VerticalLayout
          flex='flex'
          style={{
          height: layoutHeight,
          width: '100%',
          padding: 20,
          position: 'relative'
        }}
        >
          <HorizontalLayout>
            <FlexPanel style={{
              marginRight: 17
            }}>
              <DataGrid
                columns={leftColConfig}
                data={leftData}
                selected={this.leftSelected}
                onCheckedChange={this.leftSelectionChange}
                filter={leftFilter}
                sort={leftSortState}
                checkboxDisabled={this.checkboxDisabled}
                left
                onCrossDragDrop={this.onCrossDragDrop}
              />
            </FlexPanel>
            <FixedPanel
              style={{
              width: 30,
              overflow: 'visible'
            }}
            >
              <div className="btn-group-vertical">
                <Button disabled={this.leftSelected.length == 0} onClick={this.moveRight}><Icon name={ICONS.ARROW_RIGHT}/></Button>
                <Button disabled={this.rightSelected.length == 0} onClick={this.moveLeft}><Icon name={ICONS.ARROW_LEFT}/></Button>
              </div>
            </FixedPanel>
            <FlexPanel>
              <DataGrid
                columns={rightColConfig}
                data={rightData}
                selected={this.rightSelected}
                onCheckedChange={this.rightSelectionChange}
                onDragDrop={this.onDragDrop}
                filter={rightFilter}
                sort={rightSortState}
                checkboxDisabled={this.checkboxDisabled}
                onCrossDragDrop={this.onCrossDragDrop}
              />
            </FlexPanel>
          </HorizontalLayout>
        </VerticalLayout>
      </div>
    );
  }
}
