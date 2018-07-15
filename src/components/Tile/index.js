import React, { Component } from "react"
import PropTypes from 'prop-types'
import Icon, { ICONS } from '../Icon'
import Badge from '../Badge'

export default class Tile extends Component {
  static defaultProps = {
    acronym:"ABC",
    type: 'default',
    deletable: false
  }

  static propTypes = {
    badge: PropTypes.number,
    name: PropTypes.string.isRequired,
    deletable: PropTypes.bool,
    type: PropTypes.oneOf(['default', 'mini']),
    children: PropTypes.any,
    acronym: PropTypes.string,
    description: PropTypes.string,
		onDelete: PropTypes.func,
    onClick: PropTypes.func,
    index:PropTypes.any
  }

  constructor(props) {
    super(props)
    this.state = {
      deleted : false
    }
    this.onDelete = this.onDelete.bind(this)
    this.onClick = this.onClick.bind(this)
  }

  onClick(e) {
    if (this.props.onClick) {
			this.props.onClick(e)
		}
    e.stopPropagation()
  }

  onDelete(e) {
    if (this.props.onDelete) {
			this.props.onDelete(e)
    }
    this.setState({deleted:true})
    e.stopPropagation()
  }

  render() {
    let { name, type, badge, children, acronym, onClick, deletable, onDelete, description, index, ...props } = this.props
    let class_name = 'design2-tile-' + type
    if (this.state.deleted){
      return null
    }
    return (
      <div className={class_name} {...props} onClick={this.onClick}>
        {badge
          ? <Badge count={badge}/>
          :null
        }
        {children
          ? <div className="icon">{children}</div>
          : <div className="icon"><span>{acronym}</span></div>
        }
        {name
          ? <div className="name" >
              <span>{name}</span>
            </div>
          : null
        }
        {description
          ? <div className="description" >
              <span>{description}</span>
            </div>
          : null
        }
        {deletable && type !== 'mini'
          ?<div className="del" onClick={this.onDelete} ><Icon name={ICONS.TRASH} strokeWidth="0.1"/></div>
          :null
        }
      </div>
    )
  }
}
