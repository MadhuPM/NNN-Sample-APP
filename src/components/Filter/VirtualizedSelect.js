import PropTypes from 'prop-types'
import React, { Component } from 'react'
import Select,{Async} from 'react-select'
import { Scrollbars } from 'react-custom-scrollbars'
import classNames from 'classnames'
import ReactDOM,{createPortal} from 'react-dom'
import AutoSizer from 'react-virtualized/dist/commonjs/AutoSizer'
import List from 'react-virtualized/dist/commonjs/List'
const listStyle = {
    overflowX: false,
    overflowY: false
  }
export default class VirtualizedSelect extends Component {

  static propTypes = {
    async: PropTypes.bool,
    listProps: PropTypes.object,
    maxHeight: PropTypes.number,
    optionHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.func]),
    optionRenderer: PropTypes.func,
    selectComponent: PropTypes.func,
    dropUp:PropTypes.bool,
    onFocus: PropTypes.func,
    className:PropTypes.any
  };

  static defaultProps = {
    async: false,
    maxHeight: 200,
    optionHeight: 35,
    dropUp:false
  };

  constructor (props, context) {
    super(props, context)
    this.state={
      menuStyle:{}
    }
    this._renderMenu = this._renderMenu.bind(this)
    this._optionRenderer = this._optionRenderer.bind(this)
    this._setSelectRef = this._setSelectRef.bind(this)
  }

  recomputeOptionHeights (index = 0) {
    if (this._listRef) {
      this._listRef.recomputeRowHeights(index)
    }
  }
  onFocus=(e)=>{
    const {onFocus}=this.props
    onFocus?onFocus(e):null
  }
  focus () {
    if (this._selectRef) {
      return this._selectRef.focus()
    }
  }
  _setListRef=null
  handleScroll = ({ target }) => {
      const { scrollTop, scrollLeft } = target;

      const { Grid: grid } = this._setListRef;

      grid.handleScrollEvent({ scrollTop, scrollLeft });
  }

  _renderMenu ({ focusedOption, focusOption, labelKey, onSelect, options, selectValue, valueArray, valueKey }) {
    const { listProps, optionRenderer,maxHeight } = this.props
    const { menuStyle } = this.state
    const focusedOptionIndex = options.indexOf(focusedOption)
    const height = this._calculateListHeight({ options })
    const innerRowRenderer = optionRenderer || this._optionRenderer

    if(this.scroller && this.scroller.view){
      const view = this.scroller.view
      const yTop = this._calculateHeight({
        options, 
        itemIndex: focusedOptionIndex
      })
      const yBottom = this._calculateHeight({
        options, 
        itemIndex: focusedOptionIndex + 1
      })

      const yMax = view.scrollTop + view.clientHeight
      const yMin = view.scrollTop
      if (yBottom > yMax) {
        view.scrollTop += yBottom - yMax
      } else if (yTop < yMin) {
        view.scrollTop -= yMin - yTop
      }
    }

    function wrappedRowRenderer ({ index, key, style }) {
      const option = options[index]

      return innerRowRenderer({
        focusedOption,
        focusedOptionIndex,
        focusOption,
        key,
        labelKey,
        onSelect,
        option,
        optionIndex: index,
        options,
        selectValue: onSelect,
        style,
        valueArray,
        valueKey
      })
    }

    return (createPortal(<Scrollbars
      autoHeight
      autoHeightMin={0}
      autoHeightMax={maxHeight}
      ref={instance => (this.scroller = instance)}
      renderTrackHorizontal={props => <div {...props} className="track-horizontal"/>}
      renderTrackVertical={props => <div {...props} className="track-vertical"/>}
      onScroll={this.handleScroll}
      className="design2-select-portal"
      style={{...menuStyle,position:'absolute'}}
      >
    <AutoSizer disableHeight>
      {({ width }) => (
        <List
          className='VirtualSelectGrid'
          height={height}
          ref={instance => (this._setListRef = instance)}
          rowCount={options.length}
          rowHeight={({ index }) => this._getOptionHeight({
            option: options[index]
          })}
          rowRenderer={wrappedRowRenderer}
          scrollToIndex={focusedOptionIndex}
          width={width-16}
          isScrolling={false}
          style={listStyle}
          {...listProps}
        />
       
      )}
    </AutoSizer>
    </Scrollbars>,document.body)
      
    )
  }

  _calculateHeight({options, itemIndex}) {
    let height = 0

    for (let optionIndex = 0; optionIndex < itemIndex; optionIndex++) {
      let option = options[optionIndex]

      height += this._getOptionHeight({ option })
    }

    return height
  }

  _calculateListHeight ({ options }) {
    const { maxHeight } = this.props

    let height = 0

    for (let optionIndex = 0; optionIndex < options.length; optionIndex++) {
      let option = options[optionIndex]

      height += this._getOptionHeight({ option })

      if (height > maxHeight) {
        return maxHeight
      }
    }

    return height
  }

  _getOptionHeight ({ option }) {
    const { optionHeight } = this.props

    return optionHeight instanceof Function
      ? optionHeight({ option })
      : optionHeight
  }

  _getSelectComponent () {
    const { async, selectComponent } = this.props

    if (selectComponent) {
      return selectComponent
    } else if (async) {
      return Async
    } else {
      return Select
    }
  }

  _optionRenderer ({ focusedOption, focusOption, key, labelKey, option, selectValue, style, valueArray }) {
    const className = ['VirtualizedSelectOption']

    if (option === focusedOption) {
      className.push('VirtualizedSelectFocusedOption')
    }

    if (option.disabled) {
      className.push('VirtualizedSelectDisabledOption')
    }

    if (valueArray && valueArray.indexOf(option) >= 0) {
      className.push('VirtualizedSelectSelectedOption')
    }

    if (option.className) {
      className.push(option.className)
    }

    const events = option.disabled
      ? {}
      : {
        onClick: () => selectValue(option),
        onMouseEnter: () => focusOption(option)
      }

    return (
      <div
        className={className.join(' ')}
        key={key}
        style={style}
        title={option.title}
        {...events}
      >
        {option[labelKey]}
      </div>
    )
  }

  _setListRef (ref) {
    this._listRef = ref
  }

  _setSelectRef (ref) {
    this._selectRef = ref
  }
  onOpen=()=>{
    const menuDom=ReactDOM.findDOMNode(this._selectRef)
    const rect=menuDom.getBoundingClientRect()
    const computedStyle = window.getComputedStyle(menuDom);
    const fontSize = computedStyle.getPropertyValue('font-size');
    const lineHeight = computedStyle.getPropertyValue('line-height');
    const windowScoll=window.scrollY||window.pageYOffset
    const position = {
      top: windowScoll+rect.bottom - 1,
      left: rect.left,
      width: rect.width
    };
    this.setState({menuStyle:{...position, fontSize, lineHeight}})
  }
  render () {
    const SelectComponent = this._getSelectComponent()
    const {className,dropUp,...props}=this.props
    const classname=classNames(className,{'design2-dropUp':dropUp})
    return (
      <SelectComponent
        {...props}
        className={classname}
        onOpen={this.onOpen}
        ref={this._setSelectRef}
        menuRenderer={this._renderMenu}
        menuStyle={{ overflow: 'hidden' }}
      />
    )
  }
}