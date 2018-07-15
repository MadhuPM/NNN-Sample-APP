import React, { Component } from "react"
import PropTypes from 'prop-types'

export default class MiniLaunchpad extends Component {
	static defaultProps = {
	}

	static propTypes = {
		onClick:PropTypes.func.isRequired,
		children:PropTypes.any
	}

	static type='MiniLaunchpad'
	constructor(props) {
		super(props)
		this.onClick = this.onClick.bind(this)
	}
	
	onClick(e) {
		this.props.onClick()
		e.preventDefault()
	}
	render() {
		const {onClick, children, ...props } = this.props
		let childs = React.Children.toArray(children).slice(0,6)
		childs.map((child,i)=>{
			if (child.props.type !== 'mini') {
				throw Error("Mini Launchpad only take mini tile as child, type: " + child.props.type + " is here!")
			}
		})
		
        return (
			<div style={{width:"372px",paddingLeft:"15px",paddingTop:"21px",paddingBottom:"48px",display:"inline-block",
				boxShadow: "0 2px 4px 0 rgba(0, 0, 0, 0.15)",
				backgroundColor:"white"}}>
				{childs}
				<div style={{
					height: "30px",
					backgroundColor: "#f0f0f0",
					boxShadow: "0 2px 4px 0 rgba(0, 0, 0, 0.15)",
					position:"absolute",
					bottom:"0px",
					width:"372px",
					marginRight: "15px",
					marginLeft: "-15px"	
				}}>
					<a href="" 
						onClick={this.onClick}
						style={{
							fontSize:'13px',
							lineHeight: "30px",
							display:"block",
							textAlign: "center",
							color: "#2f749a"}}
					>
					More Services</a>
				</div>
            </div>
        )
	}
}
