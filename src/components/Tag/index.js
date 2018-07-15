import React, { Component } from "react"
import PropTypes from 'prop-types'
import findDOMNode from "react-dom"
import Icon, { ICONS } from '../Icon'
import classnames from 'classnames'

export default class Tag extends Component {
	static defaultProps = {
		bsClass: "tag",
		type: "keyword",
		closeable: true
	}
	static propTypes = {
		bsClass: PropTypes.string,
		label: PropTypes.string.isRequired, //text in the tag
		type: PropTypes.string, //"high","medium","low","fundname","time","keyword"
		onDelete: PropTypes.func, //remove the tag
		closeable: PropTypes.bool
	}
	constructor(props) {
		super(props)
		this.state = {
			display: true
		}
		this.onDelete = this.onDelete.bind(this)
	}
	onDelete() {
		this.setState({ display: false })
		if(this.props.onDelete){
			this.props.onDelete(this.props.label)
		}
	}
	render() {
		const display = this.state.display
		const {bsClass,type,closeable,onDelete,label,...props} = this.props
		const classname = classnames(bsClass, type)

		return (
			this.state.display? <div className="design2-tag" {...props}>
				{
					closeable?<Icon name={ICONS.CLOSE} size="10" className={`close ${type}-close`} onClick={this.onDelete} />:null
				}
				<span className={classname}>
					{label}
				</span>
			</div> : null
		)
		
	}

}
