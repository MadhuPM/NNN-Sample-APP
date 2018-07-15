import React from 'react'
import PropTypes from 'prop-types'
import Icon,{ICONS} from '../Icon'
import Menu, {SubMenu, MenuItem} from '../Menu'
import Breadcrumbs from './Breadcrumbs'
const data = []

 class SecondaryNavigation extends React.Component {
	static propTypes = {
		data: PropTypes.array,
		defaultSelectedKey: PropTypes.string,
		children: PropTypes.node,
		sideNavMode: PropTypes.string,
		autoLink: PropTypes.bool,
		autoClose: PropTypes.bool,
		onSelect: PropTypes.func,
		className:PropTypes.any,
		noFix:PropTypes.bool,
		onClick: PropTypes.func,
		defaultOpen:PropTypes.bool,
		history:PropTypes.any,
		staticContext:PropTypes.any,
		match:PropTypes.any,
		location:PropTypes.any
	}
	static contextTypes = {
		router: PropTypes.object
	}
	static defaultProps = {
		sideNavMode: 'cover',
		autoLink: true,
		autoClose: true
	}
	constructor(props) {
		super(props)
		this.state = {
			selectedKey: props.defaultSelectedKey,
			breadcrumbArray: [],
			icon: ICONS.HAMBURGER,
			visible: "",
			openKeys: [],
			width: 0,
			flatData: this.getFlatData(Object.assign(props.data, []), []),
			height:null
		}
	}
	/**
 	* If there is a defaultSelectedKey, set the default Breadcrumbs
 	*/
	componentWillMount() {
		if (this.props.defaultSelectedKey) {
				this.setBreadcrumbs(this.props.defaultSelectedKey,true)
		}
		if (this.props.defaultOpen) {
			this.setState({icon: ICONS.CLOSE, visible: "none", width: 235})
		}
	}
	componentDidMount = () => {
		this.setState({height:this.refs.nav.getBoundingClientRect().height})
	}
	componentWillReceiveProps(nextProps) {
		if (nextProps.defaultSelectedKey) {
			this.setState({selectedKey:nextProps.defaultSelectedKey})
			this.setBreadcrumbs(nextProps.defaultSelectedKey,true)
		}
		this.setState({flatData:this.getFlatData(Object.assign(nextProps.data, []), [])})
	}
	getFlatData = (arr, result, father) => {
		arr.forEach(x => {
			if (!x.father && father) {
				x.father = {
					'key': father.key,
					'title': father.title,
					father: father.father,
					link: father.link
				}
			}
			if (Array.isArray(x.children)) {
				let children = Object.assign(x.children, {})
				// delete x.children
				this.getFlatData(children, result, x)
			}
			result.push(x)
		})
		return result
	}
		/**
   * Set Breadcrumbs and open keys
   */
	setBreadcrumbs = (key,flag) => {
		const {flatData} = this.state
		let selectKey = flatData.filter(x => x.key === key)[0]
		const breadCrumbs = this.getBreadcrumbsArray(selectKey, [])
		let openKeys = []
		if (breadCrumbs.length > 1) {
			breadCrumbs.forEach((item, index) => {
				index < breadCrumbs.length - 1
						? openKeys.push(item.key)
						: null
			})
			if (selectKey.children) {
				openKeys.push(selectKey.key)
			}
		}
		let props={breadcrumbArray: breadCrumbs}
		if (flag) {
			props.openKeys=openKeys
		}
		this.setState(props)
	}
	/**
   * get Breadcrumbs Array
   */
	getBreadcrumbsArray = (key, arr) => {
		if (key&&key.father) {
				this.getBreadcrumbsArray(key.father, arr)
		}
		arr.push(key)
		return arr
	}
		/**
   * Click the icon
   */
	onClickButton = () => {
		const {icon} = this.state
		if (icon === ICONS.CLOSE) {
				this.setState({icon: ICONS.HAMBURGER, visible: '', width: 0})
		} else {
				this.setState({icon: ICONS.CLOSE, visible: "none", width: 235})
		}
	}
		/**
   * render data to Menu tree
   */
	renderMenu = (data) => {
		if (data.children) {
				return (<SubMenu title={data.title} key={data.key} link={data.link}>{data
								.children
								.map(x => this.renderMenu(x))}</SubMenu>)
		} else {
				return <MenuItem key={data.key} link={data.link}>{data.title}</MenuItem>
		}
	}
		/**
   * callback when click the menuItem or Breadcrumbs
   */
	getSelectKey = (keyInfo) => {
		this.setBreadcrumbs(keyInfo.key)
		this.setState({selectedKey: keyInfo.key})
		if (this.props.onSelect) {
				this
						.props
						.onSelect(keyInfo)
		}
		if (this.props.autoClose) {
				this.setState({icon: ICONS.HAMBURGER, visible: '', width: 0})
		}
		if (this.props.autoLink) {
			(keyInfo.item&&keyInfo.item.props.link)?this.props.history.push(keyInfo.item.props.link):null
		}
	}
		/**
   * callback when click SubMenu Title
   */
	onOpenChange = (keyInfo) => {
			this.setState({openKeys: keyInfo})
	}
	render() {
			const {breadcrumbArray,icon,visible,width,selectedKey,left,openKeys,height} = this.state
			const {data,defaultSelectedKey,sideNavMode,autoLink,className,noFix,autoClose,onClick,defaultOpen,staticContext,match,location,history,...props} = this.props
			let style = {}
		if (sideNavMode == 'push') {
				style = {
						paddingLeft: width + 'px'
				}
		}
		let rootClassName = 'secondary-navigation ' + (className
			? className
			: '') + (noFix
			? ' no-fix-navigation'
			: '')
			return (
				<div className={rootClassName} {...props}>
					<div className="design2-breadcrumbs-bar">
						<Icon
							name={icon}
							onClick={this.onClickButton}
							className={icon === ICONS.CLOSE
							? 'closeIcon'
							: null}
						/>
						<Breadcrumbs
							links={breadcrumbArray}
							autoLink={autoLink}
							visible={defaultOpen?'':visible}
							onClick={this.getSelectKey}
						/>
					</div>
					<div className='global-side-nav'>
						<div
							key='treeNavDiv'
							className='tree-nav-container'
							ref="nav"
							style={{
							width: width + 'px'
						}}
						>
						<Menu
							selectedKeys={[selectedKey]}
							openKeys={openKeys}
							inline
							onSelect={this.getSelectKey}
							onOpenChange={this.onOpenChange}
							onClick={onClick}
							height={height}
						>{(data.map(x => this.renderMenu(x)))}</Menu>
						</div>
						<div key='content' className='tree-content-container' style={style}>
							{this.props.children}
						</div>
					</div>
				</div>
			)
	}
}
const output=()=>{
  let router
  try {
    router=require("react-router-dom")
  } catch(e) {
    return SecondaryNavigation
  }
  let {withRouter}=router
  return withRouter(SecondaryNavigation)
}
export default output()