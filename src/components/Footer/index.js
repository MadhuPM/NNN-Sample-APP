import React, {Component} from "react"
import PropTypes from "prop-types"
import classNames from 'classnames'
const Block = props => {
  return (
    <a
      href={props.href
      ? props.href
      : "javascript:void(0)"}
      className="footer-link"
    >
      {props.text}
    </a>
  )
}
Block.propTypes = {
  href: PropTypes.object,
  text: PropTypes.string
}
export default class Footer extends Component {
  static defaultProps = {}
  static propTypes = {
    children: PropTypes.any,
    links: PropTypes.object,
    copyRight: PropTypes.string,
    className: PropTypes.string
  }
  static defaultProps = {
    links: {},
    copyRight: "© 2018 STATE STREET"
  }
  constructor(props) {
    super(props)
  }

  render() {
    let {
      children,links,copyRight,className,...props
    } = this.props
    let {terms, support, privacy} = links
    let classname=classNames("design2-footer",className)
    let footer = children
      ? <div className={classname} {...props}>{children}</div>
      : <div className={classname} {...props}>
        <span className="footer-link">{copyRight}</span>
        <Block href={terms} text={"TERMS OF SERVICE"}/>
        <Block href={support} text={"SUPPORT"}/>
        <Block href={privacy} text={"PRIVACY"}/>
      </div>
    return footer
  }
}
