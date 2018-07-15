import React, { Component } from "react"
import PropTypes from 'prop-types'
import { DragSource, DropTarget } from 'react-dnd'
import update from 'immutability-helper'

import LGrid from './LGrid'
import LCol from './LCol'
import MiniLaunchpad from './MiniLaunchpad'

export {MiniLaunchpad}
export default class Launchpad extends Component {
  static propTypes = {
    onOrderChange:PropTypes.func,
    savingOrder:PropTypes.func.isRequired,
    children:PropTypes.any,
    moveChild:PropTypes.any
  }
  constructor(props) {
    super(props)
    this.callback = this.callback.bind(this)
    this.moveChild = this.moveChild.bind(this)
    this.savingOrder = this.savingOrder.bind(this)
    let tiles = this.props.children
    this.state = {
      tiles : tiles
    }
  }

  componentWillUnmount(){
    this.savingOrder()
  }
  moveChild(dragIndex, hoverIndex) {
    //depend on LCol's index prop
		const { tiles } = this.state
		const dragCard = tiles[dragIndex]
		this.setState(
			update(this.state, {
				tiles: {
					$splice: [[dragIndex, 1], [hoverIndex, 0, dragCard]]
				}
			}),
    )
  }

  savingOrder(){
    this.props.savingOrder(React.Children.map(this.state.tiles,(child, index)=>{
      return child.props.index
    }))
  }

  callback(){
    this.props.onOrderChange(React.Children.map(this.state.tiles,(child, index)=>{
      return child.props.index
    }))
  }

  render() {
    const {onOrderChange, children, moveChild, ...props } = this.props;
    const { tiles } = this.state

    return (
      <LGrid>
        {React.Children.map(tiles,(child, i) =>
            <LCol
              style={{ height: "170px", margin: "15px" }}
              key={child.props.index || i} //should provide special key (Tile's props id) to make favorite savings
              index={i}                   //important
              id={child.id || i}
              md={child.md || 2}
              moveChild={this.moveChild}
              callback={this.callback}
            >
              {child}
            </LCol>
        )}
      </LGrid>
    )
  }
}
