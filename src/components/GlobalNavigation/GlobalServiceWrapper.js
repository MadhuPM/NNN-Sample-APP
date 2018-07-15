import React from "react"
import PropTypes from 'prop-types'
import {Navbar, NavDropdown, MenuItem} from "react-bootstrap"
import Icon from '../Icon'
import classNames from 'classnames'
import ReactDOM from 'react-dom'
import Tile from '../Tile'
import MiniLaunchpad from '../Launchpad/MiniLaunchpad'
import {contains} from '../Menu/util'
export default class GlobalServiceWrapper extends React.Component  {
  static propTypes = {
    position: PropTypes.string,
    onToggleLink:PropTypes.func,
    activeLink:PropTypes.string,
    children:PropTypes.any
  }
  /**
   * @type {object}
   * @property {string} activeLink - which link is active
   * @property {string} greeting - greeting based on local time
   */
  constructor(props) {
    super(props)
    this.state = {

    }
  }
  /**
   * @desc Render method
   * @return {ReactElement} CDTHeader Markup
   */
    /**
   * Set selectedKeys in state when receice props 
   */
  /**
   * If it is dropdown mode, add or remove event listener based on the dropdown state
   */
  componentDidUpdate() {
      if (this.props.activeLink!=='') {
        document.addEventListener('click', this.handleDocumentClick, true)
      } else {
        document.removeEventListener('click', this.handleDocumentClick, true)
      }
  }
  /**
   * remore eventListener when the component is destroyed
   */
  componentWillUnmount() {
    document.removeEventListener('click', this.handleDocumentClick, true)
  }
    /**
   * onClick Toggle in three links
   */
  onToggleLink = (e) => {
    this.props.onToggleLink(e)
}
  /**
   * click the document and if it is not in the menu,close the dropdown
   */
  handleDocumentClick = (e) => {
    // If the click originated from within this component don't do anything.
    if (contains(ReactDOM.findDOMNode(this), e.target)) {
      return false
    }
    this.onToggleLink(null)
  }
  render() {
    const {activeLink,children}=this.props
    const ChildrenList=React.Children.toArray(children)
    let [launchpad,alert,search]=[null,null,null]
    let messageNum=0
    ChildrenList.map((child)=>{
        switch (child.type.type) {
            case 'MiniLaunchpad':
            launchpad=child
                break
            case 'GlobalSearch':
            search=child
                break
            case 'AlertCenter':
            alert=child
        }
    })
    if (alert) {
      let messages=alert.props.data
      for (const key in messages) {
        if (messages.hasOwnProperty(key)) {
          const element = messages[key];
          let unreadMessage=element.filter((message)=>{
            return message.isRead==false
          })
          messageNum+=unreadMessage.length
        }
      }
    }
    let alertClass=classNames('navIcon', 'alertIcon',{'zeroAlert':messageNum==0,'hundredAlert':messageNum>99})
    if (messageNum>99) {
      messageNum=99
    }
    return (
        <div className="serviceWrapper">        
            {search
              ? <div className="navBox">
                  <a className="navLink searchLink"
                  data-key="search" onClick={this.onToggleLink}
                  >
                    <Icon name="search" className="navIcon" size="25px" color="#fff"/>
                  </a>
                  {(activeLink == 'search')
                    ? < div className = "searchArea" >{search}</div>
                    : null}
                </div>
              : null}
            {launchpad
              ? <div className="navBox launchBox">
                  <a
                    className="navLink launchLink"
                    data-key="launchpad"
                    onClick={this.onToggleLink}
                  >
                    <Icon name="launchpad"  ref='target1' className="navIcon" size="25px" color="#fff"/>
                  </a>
                  {(activeLink == 'launchpad')
                    ? < div className = "launchpadArea" >{launchpad}</div>
                    : null}
                </div>
              : null}
            {alert
              ? <div className="navBox alertBox">
                  <a
                    className="navLink alertLink"
                    data-key="alert"
                    onClick={this.onToggleLink}
                  >
                    <i className={alertClass}>{messageNum}</i>
                  </a>
                  {(activeLink == 'alert')
                    ? alert
                    : null}
                </div>
              : null}
            </div>
    )
  }
}
