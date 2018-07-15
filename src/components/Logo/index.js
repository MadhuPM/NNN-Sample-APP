import React, {Component} from "react"
import PropTypes from 'prop-types'
import invariant from 'invariant'
import {Link as RouterLink } from "react-router-dom"
import {logo} from "./LogoImage"
export default class Logo extends Component {
  static propTypes = {
    productName: PropTypes.string,
    logoLink:PropTypes.any
  }
  static contextTypes = {
    router: PropTypes.any
  }

  render() {
    let {productName,logoLink} = this.props
    let el, Link;
    let logoImg = <img src={logo} className="logoImg" alt="StateStreet Logo"/>;
    if (React.isValidElement(logoLink)) {
      el = React.cloneElement(logoLink,
        { children: logoImg, className: "logoLink" })
    } else if (typeof logoLink === 'function') {
      Link = logoLink;
    } else {
      Link = RouterLink;
      invariant(this.context.router,
        `Please consider passing a link element as 'logoLink' prop if you are using 'Logo' outside of 'Router'`);
    }

    return (
      <div className="design2Logo">
        {el ||
          (<Link to={logoLink?logoLink:'/'} className="logoLink">
            {logoImg}
          </Link>)}
        {productName
          ? <span className="productName hidden-xs">
              {productName}
            </span>
          : null}
      </div>
    )
  }
}
