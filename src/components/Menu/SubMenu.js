import React, {Component} from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import {emptyFunc} from './util'
import {Navbar, NavDropdown, MenuItem} from "react-bootstrap"
import ReactDOM from 'react-dom'

export default class SubMenu extends Component {
  static propTypes = {
    children: PropTypes.any,
    level: PropTypes.number,
    onTitleClick: PropTypes.func,
    link:PropTypes.string,
    onClick:PropTypes.func,
    onSelect:PropTypes.func,
    onDeselect:PropTypes.func,
    onOpenChange:PropTypes.func,
    defaultSelectedKeys: PropTypes.arrayOf(PropTypes.string),
    selectedKeys:PropTypes.array,
    eventKey:PropTypes.any,
    openKeys:PropTypes.array,
    disabled:PropTypes.bool,
    title:PropTypes.any,
    inline:PropTypes.bool,
    multiple:PropTypes.bool,
    width:PropTypes.number,
    parentWidth:PropTypes.number,
    parentMenu:PropTypes.any,
    parentScroll:PropTypes.any,
    parentHeight:PropTypes.any,
    placement:PropTypes.any
  }
  static defaultProps = {
    onTitleClick: emptyFunc,
    width:130
  }
  /**
   * @type {object}
   * @property {string} hoverVisiable -''or 'none',control hover state in dropdown mode
   */
  constructor(props) {
    super(props)
    let selectedKeys =[] 
    if ( props.defaultSelectedKeys) {
      selectedKeys=props.defaultSelectedKeys
    }
    if ('selectedKeys' in props&&selectedKeys) {
      selectedKeys = props.selectedKeys || []
    }
    this.state = {
      selectedKeys,
      hoverVisiable:'',
      offsetHeight:null,
      hasScroll:false,
      isEdge:false,
      hasDetect:false
    }
  }
  /**
   * Set greeting word before render
   */
  componentWillMount() {
    if (this.props.parentMenu.subMenuInstance === this) {
      this.clearSubMenuLeaveTimer()
    }
  }
    /**
   * Set selectedKeys in state when receice props 
   */
  componentWillReceiveProps(nextProps) {
    const props = {}
    if ('selectedKeys' in nextProps) {
      props.selectedKeys = nextProps.selectedKeys || []
    }
    if ('defaultSelectedKeys' in nextProps) {
      props.selectedKeys = nextProps.defaultSelectedKeys || []
    }
    this.setState(props)
  }
  /**
   * delivery onClick from props to children,add the key path of this subMenu
   */
  onClick = (info) => {
    this.props.onClick(this.addKeyPath(info))
  }
  /**
   * delivery onSelect from props to children
   */
  onSelect = (selectInfo) => {
    const {onSelect,defaultSelectedKeys,multiple}=this.props
    if (defaultSelectedKeys) {
      selectInfo.noBubble=true
      let selectedKeys = this.state.selectedKeys
      const selectedKey = selectInfo.key
      if (multiple) {
        selectedKeys = selectedKeys.concat([selectedKey])
      } else {
        selectedKeys = [selectedKey]
      }
      if (!('selectedKeys' in this.props)) {
        this.setState({
          selectedKeys
        })
      }
      onSelect({...this.addKeyPath(selectInfo),selectedKeys})
    }else{
      onSelect(this.addKeyPath(selectInfo))
    }
    
  }
  /**
   * delivery onDeselect from props to children
   */
  onDeselect = (selectInfo) => {
    const {onDeselect,defaultSelectedKeys}=this.props
    const selectedKeys = this.state.selectedKeys.concat()
    const selectedKey = selectInfo.key
    const index = selectedKeys.indexOf(selectedKey)
    if (defaultSelectedKeys) {
      if (index !== -1) {
        selectedKeys.splice(index, 1)
      }
      if (!('selectedKeys' in this.props)) {
        this.setState({
          selectedKeys
        })
      }
      onDeselect({
        ...this.addKeyPath(selectInfo),
        selectedKeys
      })
    }else{
      onDeselect(this.addKeyPath(selectInfo))
    }
  }
  /**
   * delivery onOpenChange from props to children
   */
  onOpenChange = (e) => {
    const {onOpenChange,inline,parentMenu,width}=this.props
    onOpenChange(e)
    if (e.open&&!inline) {
      setTimeout(()=> {
        let windowWidth= document.documentElement.clientWidth || document.body.clientWidth
        let ifRightEdge=(windowWidth-width-parentMenu.list.getBoundingClientRect().right)<0
        ifRightEdge?this.setState({isEdge:true,hasDetect:true}):this.setState({hasDetect:true})
        if (this.list.scrollHeight>this.list.clientHeight) {
          this.setState({hasScroll:true})
        }
      }, 0);
    }
  }
  /**
   * Judge this menuItem  is selected
   */
  isSelected = () => {
    const {eventKey,defaultSelectedKeys,selectedKeys}=this.props
    if (defaultSelectedKeys) {
      return this
      .state
      .selectedKeys
      .indexOf(eventKey) !== -1
    }
    return selectedKeys
      .indexOf(eventKey) !== -1
  }
  /**
    * render children after adding more props in them
    */
  renderMenuItem = (child, index) => {
    if (!child) {
      return null
    }
    const props = this.props
    const state=this.state
    const childProps = {
      eventKey: child.key,
      openKeys: props.openKeys,
      parentMenu: this,
      onClick: this.onClick,
      onSelect: this.onSelect,
      onDeselect: this.onDeselect,
      onOpenChange: this.onOpenChange,
      level: props.level + 1,
      multiple: props.multiple,
      inline: props.inline,
      onHide:props.onHide,
      parentWidth:props.width,
      parentScroll:state.hasScroll,
      parentHeight:props.parentHeight,
      dropdownOpen:props.dropdownOpen,
      placement:props.placement
    }
    if (!child.props.defaultSelectedKeys) {
      if (props.defaultSelectedKeys) {
        childProps.selectedKeys=state.selectedKeys
      }else{
        childProps.selectedKeys=props.selectedKeys
      }
    }
    if (child.props.multiple) {
      childProps.multiple=child.props.multiple
    }else{
      childProps.multiple=props.multiple
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
    // console.log(childProps)
    return React.cloneElement(child, childProps)
  }
    /**
   * Judge this menuItem  is opened
   */
  isOpen = () => {
    return this.props.openKeys.indexOf(this.props.eventKey) !== -1
  }
  /**
   * trigger the open change
   */
  triggerOpenChange = (open, type) => {
    const {props} = this
    const key = props.eventKey
    this.onOpenChange({key, item: this, trigger: type, open})
  }
  /**
   * add key path
   */
  addKeyPath = (info) => {
    return {
      ...info,
      keyPath: (info.keyPath || []).concat(this.props.eventKey)
    }
  }
  /**
   * click the title to trigger change in inline mode
   */
  onTitleClick = (e) => {
    const {onTitleClick,eventKey,inline,link,onClick,onSelect} = this.props
    onTitleClick?onTitleClick({key: eventKey, domEvent: e}):null
    if (!inline) {
      return false
    }
    this.triggerOpenChange(!this.isOpen(), 'click')
    if (link) {
      const selected = this.isSelected()
      const info = {
        key: eventKey,
        keyPath: [eventKey],
        item: this,
        domEvent: e
      }
      onClick(info)
      if(!selected){
        onSelect(info)
      }
    }
  }
  /**
   * mouse enter the title to trigger change in dropdown mode
   */
  onTitleMouseEnter = (e) => {
    const {parentMenu} = this.props
        if (this.refs.target) {
      let offsetHeight=parentMenu.list?this.refs.target.offsetTop-parentMenu.list.scrollTop:this.refs.target.offsetTop
      this.setState({offsetHeight})
    }
    this.triggerOpenChange(true, 'mouseEnter')
  }
  /**
   * mouse leave the title to trigger change in dropdown mode
   */
  onMouseLeave = (e) => {
    const {inline,parentMenu} = this.props
    parentMenu.subMenuInstance = this
    parentMenu.subMenuLeaveFn = () => {
      if (!inline) {
        this.triggerOpenChange(false, 'mouseLeave')
        }
    }
    parentMenu.subMenuLeaveTimer = setTimeout(parentMenu.subMenuLeaveFn, 0)
  }
  clearSubMenuLeaveTimer() {
    const parentMenu = this.props.parentMenu
    if (parentMenu.subMenuLeaveTimer) {
      clearTimeout(parentMenu.subMenuLeaveTimer)
      parentMenu.subMenuLeaveTimer = null
      parentMenu.subMenuLeaveFn = null
    }
  }
  render() {
    const {children, title, level, inline,disabled,eventKey,width,parentWidth,parentScroll,parentHeight,placement} = this.props
    const {offsetHeight,hasScroll,isEdge,hasDetect} = this.state
    let childrenLength = children
      ? (Array.isArray(children)
        ? children.length
        : 1)
      : 0
    let titleClass = classNames('subMenuTitle', {
      'lowLevel': level > 2,
      'lowerLevel':level> 3 ,
      'disabledSubMenu':disabled,
      'selectedItem': this.isSelected(),
      'edgeItem':isEdge&&placement!=="top",
      'upItem':isEdge&&placement=="top"
    })
    let listClass = classNames('subList', {
      'openList': this.isOpen(),
      'closeList':!this.isOpen()
    })
    let titleMouseEvents={},MouseEvents={}
    if (!disabled) {
    titleMouseEvents = {
        onMouseEnter: this.onTitleMouseEnter,
        onClick:this.onTitleClick
      }
    MouseEvents = {
        onMouseLeave: this.onMouseLeave
      }
    }
    let containerStyle=offsetHeight?{top:offsetHeight+'px'}:null
    let hoverVisiable=this.isOpen()&&hasDetect?'':'none'
    let subListLeft={left:parentWidth+"px"}
    if (parentScroll) {
      subListLeft.left=parentWidth-17+"px"
    }
    if (isEdge) {
      subListLeft.top="30px"
      subListLeft.left="auto"
      subListLeft.right=0
    }
    if (placement=="top") {
      subListLeft.top="auto"
      if (isEdge) {
         subListLeft.bottom="-10px"
      }else{
        subListLeft.bottom="-40px"
        subListLeft.marginBottom="0"
      }
    }
    let SubMenu = !inline
      ? (
        <div className="dropdownSubMenu"  ref="target">
          <div className={titleClass} {...titleMouseEvents}>{title}</div>
          <div className="overlay-container" ref="container" style={containerStyle}>
            <ul className='subList' style={{display:hoverVisiable,width:width+"px",...subListLeft}}>
            <div className="scroll-box" ref={(list) => { this.list = list}} style={{maxHeight:parentHeight+"px"}}>{React.Children.map(children, this.renderMenuItem)}</div></ul>
          </div>
        </div>
      )
      : (
        <div className="inlineSubMenu">
          <div
            className={titleClass}
            style={{
            'paddingLeft': (level - 1) * 15 + 'px'
          }}
            onClick={!disabled?this.onTitleClick:null}
          >{title}</div>
          <ul 
          className={listClass}
            id={'subList'+eventKey} 
          >{React.Children.map(children, this.renderMenuItem)}</ul>
        </div>
      )
    return (
      <div className="subMenuContainer" {...MouseEvents}>
        {SubMenu}
      </div>

    )
  }

}
