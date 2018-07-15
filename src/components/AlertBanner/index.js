import React, { Component } from "react"
import PropTypes from 'prop-types'
import ReactDOM, { findDOMNode, unmountComponentAtNode } from "react-dom"
import Icon, { ICONS } from '../Icon'
import RootCloseWrapper from './RootCloseWrapper.js'
import classnames from 'classnames'

const iconName = {
	confirmation: "check-circle",
	attention: "alert-triangle",
	warning: "alert-circle"
}
const layer = document.createElement('div')
document.body.appendChild(layer)

export default class AlertBanner extends Component {
	static defaultProps = {
		type: "confirmation",
		titleHidden: false,
		animation: "fade-in",
		rootClose: false
	}
	static propTypes = {
		animation: PropTypes.string,
		titleHidden: PropTypes.bool,
		inline: PropTypes.bool,
		alertOffsetTop: PropTypes.string,
		label: PropTypes.string,
		type: PropTypes.oneOf([
			"confirmation", "attention", "warning"
		]),
		rootClose: PropTypes.bool,
		onClose: PropTypes.func,
		className: PropTypes.any,
		children: PropTypes.any
	}
	static show = function (type = 'confirmation', label, onClose,rootClose) {
		let layerChild = document.createElement('div')
		layer.appendChild(layerChild)

		ReactDOM.render(<AlertBanner type={type} label={label} onClose={onClose ? onClose : null} rootClose={rootClose} />, layerChild)
	}
	constructor(props) {
		super(props)
		this.state = {
			show: true
		}
		this.onClose = this.onClose.bind(this)
	}
	componentDidMount() {
		if (this.props.type === "confirmation") {
			this.timeOut = setTimeout(() => this.onClose(), 3000)
		}
	}
	componentWillUnmount() {
		clearTimeout(this.timeOut)
	}
	onClose() {
		const { inline, onClose } = this.props

		if (!inline) {
			const container = findDOMNode(this).parentNode
			layer.removeChild(container)
			unmountComponentAtNode(container)
		} else {
			clearTimeout(this.timeOut)
			this.setState({ show: false })
		}

		if (onClose) {
			onClose()
		}
	}

	render() {
		const { type, alertOffsetTop, animation, inline, children, titleHidden, label, className, rootClose, ...props } = this.props
		const lowerCaseType = type.toLowerCase()
		const classname = classnames("design2-alert-banner", animation, {
			fixed: !inline
		}, className)

		let child = (
			this.state.show ? <div className={classname} style={{ top: alertOffsetTop }}>
				<div className={lowerCaseType}>
					<Icon className="iconLeft" name={iconName[lowerCaseType]} size="20" />
					{titleHidden ? null : <span className="title">{type.toUpperCase()}</span>}
					<span className="label" style={{ width: titleHidden ? "calc(100% - 70px)" : "calc(100% - 220px)", fontSize: titleHidden ? "20px" : "16px" }}>{label ? label : children}</span>
					<Icon className="iconRight" name={ICONS.CLOSE} size="16" onClick={this.onClose} />
				</div>
			</div> : null
		)

		if (rootClose) {
			child = (
				<RootCloseWrapper onRootClose={this.onClose}>
					{child}
				</RootCloseWrapper>
			)
		}

		return (
			<div>
				{child}
			</div>
		)

	}

}
