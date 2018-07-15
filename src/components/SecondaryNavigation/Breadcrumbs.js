import React from 'react'
import PropTypes from 'prop-types'

class Breadcrumbs extends React.Component {
  static propTypes = {
    links: PropTypes.array.isRequired,
    onClick:PropTypes.func,
    visible:PropTypes.string,
    autoLink:PropTypes.bool,
    history:PropTypes.any
  }
  static contextTypes = {
    router: PropTypes.object
}
  getSelectKey=(item)=>{
    const {onClick,autoLink}=this.props
    onClick?onClick({key:item.key}):null
    if (autoLink) {
      this.props.history.push(item.link)
    }
  }
  render() {
    const {links, visible,autoLink,...props} = this.props
    // console.log(links)
    return (
      <ul style={{display: visible}} className='design2-breadcrumb'>
        {links.length>0&&links[0]?links.map((item, index) => {
          // console.log(item.link)
          if (index === links.length - 1 || !item.key||!item.link) {
            return <li key={item.key}>{item.title}</li>
          }
            return <li key={item.key}><a className={'BreadcrumbsLink'+index+' manualLink'} onClick={() => this.getSelectKey(item)}>{item.title}</a></li>
        }):null}
      </ul>
    )
  }
}
const output=()=>{
  let router
  try {
    router=require("react-router-dom")
  } catch(e) {
    return Breadcrumbs
  }
  let {withRouter}=router
  return withRouter(Breadcrumbs)
}
export default output()