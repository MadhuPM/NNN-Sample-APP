import React from "react"
import PropTypes from 'prop-types'
import {Navbar, NavDropdown, MenuItem} from "react-bootstrap"
import Logo from '../Logo'
import Icon from '../Icon'
import classNames from 'classnames'
import ReactDOM from 'react-dom'
import { withRouter } from "react-router-dom"
import Tile from '../Tile'
import MiniLaunchpad from '../Launchpad/MiniLaunchpad'
import GlobalServiceWrapper from './GlobalServiceWrapper'

class GlobalNavigation extends React.Component {
  static propTypes = {
    userName: PropTypes.string,
    productName: PropTypes.string,
    profileMenu: PropTypes.array,
    position: PropTypes.string,
    launchpad: PropTypes.any,
    children: PropTypes.any,
    onSelect:PropTypes.func,
    logoLink:PropTypes.string,
    history:PropTypes.any
  }
  /**
   * @type {object}
   * @property {string} activeLink - which link is active
   * @property {string} greeting - greeting based on local time
   */
  constructor(props) {
    super(props)
    this.state = {
      activeLink: '',
      greeting: 'Good Morning'
    }
  }
  /**
   * Set greeting word before render
   */
  componentWillMount() {
    const hour = new Date().getHours()
    if (hour >= 18) {
      this.setState({greeting: 'Good Evening'})
    } else if (hour >= 12) {
      this.setState({greeting: 'Good Afternoon'})
    }
  }
  /**
   * onClick Toggle in three links
   */
  onToggleLink = (e) => {
    if (!e) {
      this.setState({activeLink: ''})
      return false
    }
    const linkType=e.currentTarget.getAttribute('data-key')
    let data = {}
    this.state.activeLink === linkType
      ? this.setState({activeLink: ''})
      : this.setState({activeLink: linkType})

  }
  /**
   * click profileMenu and reset the link state
   */
  resetActive = () => {
    this.setState({activeLink: ''})
  }
  onSelect = (eventKey,event) =>{
    const {onSelect}=this.props
    event.preventDefault()
    let link=this.props.profileMenu.filter((item)=>item.label==eventKey)[0].link
    link?this.props.history.push(link):null
    onSelect?onSelect(eventKey,event):null
  }
  /**
   * @desc Render method
   * @param {string} logo - logo image with absolute path as require('../images/logo.png')
   * @param {string} username - User name to be displayed.
   * @param {string} productName - Product name to be displayed.
   * @param {object} search - the search Component that use in the navigation
   * @param {launchpad} search - the launchpad Component that use in the navigation
   * @param {alert} search - the alert Component that use in the navigation
   * @return {ReactElement} CDTHeader Markup
   */
  render() {
    const {position,profileMenu,productName,userName,children,logoLink,...props}=this.props
    const {activeLink,greeting}=this.state
    let data = profileMenu?profileMenu.map((value, key)=><MenuItem href={value.link} key={value.label} eventKey={value.label}>{value.label}</MenuItem>):[]
    let headerClass = classNames({
      Design2GlobalNavigation: true,
      searchActive: (activeLink === 'search'),
      launchActive: (activeLink === 'launchpad'),
      alertActive: (activeLink === 'alert')
    })
    let positionState=position?position:'fixed'
    let zIndex=position?9999:10001
    return (
      <header className={headerClass}>
        <Navbar fluid style={{position:positionState,zIndex:zIndex}}>
          <Navbar.Header>
            <div className="Design2GlobalNavigation__LogoContainer">
              <Logo productName={productName} logoLink={logoLink}/>
            </div>
          </Navbar.Header>
          <nav className='headercontent pull-right'>
          <GlobalServiceWrapper activeLink={activeLink} onToggleLink={this.onToggleLink} {...props}>{children}</GlobalServiceWrapper>
          <NavDropdown
              className='profileMenu'
              title={userName
              ? (`${greeting}, ${userName}`)
              : (greeting)}
              id="profileMenu"
              onClick={this.resetActive}
              onSelect={this.onSelect}
          >
              {data}
            </NavDropdown>
          </nav>
        </Navbar>
      </header>
    )
  }
}

export default class GlobalNav extends React.Component {
  static contextTypes = {
    router: PropTypes.any
  }

  constructor(props, context) {
    super(props, context);
    if (context.router) {
      this.Nav = withRouter(GlobalNavigation);
    } else {
      this.Nav = GlobalNavigation;
    }
  }

  render() {
    return (<this.Nav {...this.props} />);
  }
}
