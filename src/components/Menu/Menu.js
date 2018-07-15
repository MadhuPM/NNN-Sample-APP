import React, {Component} from 'react'
import PropTypes from 'prop-types'
import ReactDOM from 'react-dom'
import SubMenu from './SubMenu'
import MenuItem from './MenuItem'
import classNames from 'classnames'
import {emptyFunc, contains} from './util'
import Icon from '../Icon'
import Overlay from '../Overlay'
import SubPopMenu from './SubPopMenu'
import { Scrollbars } from 'react-custom-scrollbars'
export default class Menu extends Component {
  static propTypes = {
    inline: PropTypes.bool,
    title: PropTypes.any,
    selectedKeys: PropTypes.arrayOf(PropTypes.string),
    defaultSelectedKeys: PropTypes.arrayOf(PropTypes.string),
    defaultOpenKeys: PropTypes.arrayOf(PropTypes.string),
    openKeys: PropTypes.arrayOf(PropTypes.string),
    onOpenChange: PropTypes.func,
    onSelect: PropTypes.func,
    onDeselect: PropTypes.func,
    onClick: PropTypes.func,
    children: PropTypes.node,
    className: PropTypes.any,
    multiple: PropTypes.bool,
    test:PropTypes.bool,
    width:PropTypes.number,
    placement:PropTypes.string,
    offsetX:PropTypes.number,
    offsetY:PropTypes.number,
    onTitleClick:PropTypes.func,
    dropdownClassName:PropTypes.string,
    target:PropTypes.any,
    show:PropTypes.bool,
    onHide:PropTypes.func,
    flexHeader:PropTypes.bool,
    height:PropTypes.number
  }
  static defaultProps = {
    inline: false,
    defaultSelectedKeys: [],
    defaultOpenKeys: [],
    onOpenChange: emptyFunc,
    onSelect: emptyFunc,
    onDeselect: emptyFunc,
    onClick: emptyFunc,
    placement:"bottom",
    width:168,
    height:300
  }
  /**
   * @type {object}
   * @property {array} selectedKeys - current selected key
   * @property {array} openKeys - current open subMenu key
   * @property {array} level - the intial level of a menu
   * @property {string} singleTitle - when single selection, show the select output in the title place
   *  @property {boolean} dropdownState - in dropdown mode, whether the dropdown is showed
   */
  constructor(props) {
    super(props)
    let selectedKeys = props.defaultSelectedKeys
    let openKeys = props.defaultOpenKeys
    if ('selectedKeys' in props) {
      selectedKeys = props.selectedKeys || []
    }
    if ('openKeys' in props) {
      openKeys = props.openKeys || []
    }
    this.state = {
      selectedKeys,
      openKeys,
      level: 1,
      singleTitle: '',
      dropdownState: false,
      showUp:false,
      hasScroll:false,
      adjustOffsetX:0,
      rightPlace:false
    }
  }
  /**
   * Set selectedKeys and openKeys in state when receice props
   */
  componentWillReceiveProps(nextProps) {
    const props = {}
    if ('selectedKeys' in nextProps) {
      props.selectedKeys = nextProps.selectedKeys || []
    }
    if ('openKeys' in nextProps) {
      props.openKeys = nextProps.openKeys || []
    }
    this.setState(props)
  }
  /**
   * onClick, get e from children
   */
  onClick = (e) => {
    this
      .props
      .onClick(e)
  }
  /**
   * onSelect, get select info from children, and set selectedKeys and singleTitle
   */
  onSelect = (selectInfo) => {
    const props = this.props
    let selectedKeys = this.state.selectedKeys
    let singleTitle = this.state.singleTitle
    const selectedKey = selectInfo.key
    if (!selectInfo.noBubble) {
      if (props.multiple) {
        selectedKeys = selectedKeys.concat([selectedKey])
      } else {
        selectedKeys = [selectedKey]
        singleTitle = selectInfo.item.props.children
      }
      if (!('selectedKeys' in props)) {
        this.setState({selectedKeys, singleTitle})
      }
      props.onSelect({
        ...selectInfo,
        selectedKeys
      })
    }

  }
  /**
   * onDeselect, only can be used in mltiple mode,get deselect info from children, and set selectedKeys
   */
  onDeselect = (selectInfo) => {
    const props = this.props
    const selectedKeys = this
      .state
      .selectedKeys
      .concat()
    const selectedKey = selectInfo.key
    const index = selectedKeys.indexOf(selectedKey)
    if (index !== -1) {
      selectedKeys.splice(index, 1)
    }
    if (!('selectedKeys' in props)) {
      this.setState({selectedKeys})
    }
    props.onDeselect({
      ...selectInfo,
      selectedKeys
    })
  }
  /**
   * onOpenChange, get event from children, set openkeys and it is support batch change
   */
  onOpenChange = (e) => {
    const props = this.props
    const openKeys = this
      .state
      .openKeys
      .concat()
    let changed = false
    let oneChanged = false
    if (e.open) {
      oneChanged = openKeys.indexOf(e.key) === -1
      if (oneChanged) {
        openKeys.push(e.key)
      }
    } else {
      const index = openKeys.indexOf(e.key)
      oneChanged = index !== -1
      if (oneChanged) {
        openKeys.splice(index, 1)
      }
    }
    changed = changed || oneChanged
    if (changed) {
      if (!('openKeys' in this.props)) {
        this.setState({openKeys})
      }
      props.onOpenChange(openKeys)
    }
  }
  /**
   * render children after adding more props in them
   */
  renderMenuItem = (child, index) => {
    if (!child) {
      return null
    }
    const state = this.state
    const props = this.props
    const childProps = {
      eventKey: child.key,
      openKeys: state.openKeys,
      parentMenu: this,
      onClick: this.onClick,
      onSelect: this.onSelect,
      onDeselect: this.onDeselect,
      onOpenChange: this.onOpenChange,
      level: state.level + 1,
      inline: props.inline,
      onHide:this.onHide,
      parentWidth:props.width,
      parentScroll:state.hasScroll,
      parentHeight:props.height,
      dropdownOpen:props.show||state.dropdownState,
      placement:state.showUp?'top':props.placement
    }
    if (!child.props.defaultSelectedKeys) {
      childProps.selectedKeys = state.selectedKeys
    }
    if (child.props.onSelect) {
      childProps.onSelect=child.props.onSelect
      childProps.once=true
    }else{
      childProps.onSelect=this.onSelect
    }
    if (child.props.onDeselect) {
      childProps.onDeselect=child.props.onDeselect
    }else{
      childProps.onDeselect=this.onDeselect
    }
    if (child.props.multiple) {
      childProps.multiple = child.props.multiple
    } else {
      childProps.multiple = props.multiple
    }
    return React.cloneElement(child, childProps)
  }
  /**
   * click the title or overflow to show or hide the dropdown in dropdown mode
   */
  onHide=(e)=>{
    const {onHide,inline,flexHeader}=this.props
    onHide?onHide(e):null
    if (!inline) {
      if (!flexHeader) {
        this.setState({dropdownState: false})
      }
      this.setState({openKeys:[]})
    }
  }
  onEntered=(e)=>{
    let {left,top,width,height}=e.getBoundingClientRect()
    let state={rightPlace:true}
    // check whether the horizontal offsex need adjust
    if (left<0||left+width>document.documentElement.clientWidth) {
      state.adjustOffsetX=left<0?left:left+width-document.documentElement.clientWidth
    }
    // check whether the scroll need to be add
    if (this.list.scrollHeight>this.list.clientHeight) {
      state.hasScroll=true
    }
    // check whether the placement need to be up rather than bottom
    if (height+top>document.documentElement.clientHeight) {
      state.showUp=true
      }else{
      state.showUp=false
     }
     this.setState(state)
    }
  onExited=(e)=>{
    this.setState({showUp:false,rightPlace:false})
  }
  dropdownStateChange = (e) => {
    let props={}
    if (this.state.dropdownState) {
      props.dropdownState=false
      if (!this.props.inline) {
        props.openKeys=[]
      }
      this.setState(props)
    } else {
      props.dropdownState=true
      this.props.onTitleClick?this.props.onTitleClick(e,props.dropdownState):null
      this.setState(props)
    }
  }
  render() {
    const {data, selectedKeys, singleTitle, iconName, dropdownState,showUp,adjustOffsetX,rightPlace} = this.state
    const {children, title, inline, multiple, className,test,placement,width,offsetX,offsetY,dropdownClassName,target,show,onHide,flexHeader,height} = this.props
    let mainClass=classNames(className,'design2-menu',{
      'dropdown-box':!inline&&flexHeader
    })
    let containerClass = classNames({
      'inline-container': inline,
      'dropdown-container': !inline,
      'hideContainer':!children
    })
    let menuHeader = !inline
      ? <div ref='target' className="menu-header" onClick={this.dropdownStateChange}>{(title
            ? title
            : <Icon ref='target' name='more'/>)}</div>
      : null
    let menuContent = !inline&&children
      ? <Overlay
          show={flexHeader?show:this.state.dropdownState}
          onHide={this.onHide}
          placement={showUp?'top':placement}
          rootClose
          ref={(overlay) => { this.overlay = overlay}}
          container={test?this:document.body}
          onEntered={this.onEntered}
          onExited={this.onExited}
          target={flexHeader?this.props.target:() => ReactDOM.findDOMNode(this.refs.target)}
        >
          <SubPopMenu dropdownStateChange={this.onHide} width={width} offsetX={offsetX} offsetY={offsetY} rightPlace={rightPlace} adjustOffsetX={adjustOffsetX} className={dropdownClassName}><div className="scroll-box" ref={(list) => { this.list = list}} style={{maxHeight:height+"px"}}>{React
              .Children
              .map(children, this.renderMenuItem)}</div></SubPopMenu>
        </Overlay>
      : <div className="menu-list-box">
      <Scrollbars 
        autoHeight
        autoHeightMin={0}
        autoHeightMax={height}
        renderTrackHorizontal={props => <div {...props} className="track-horizontal"/>}
        renderTrackVertical={props => <div {...props} className="track-vertical"/>}
      >{React
          .Children
          .map(children, this.renderMenuItem)}</Scrollbars></div>
    return (
      <div className={mainClass}>
        <div className={containerClass}> {flexHeader?null:menuHeader}{menuContent}
        </div>
      </div>
    )
  }

}
