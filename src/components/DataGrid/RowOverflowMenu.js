import React, { Component } from 'react';
import { PropTypes } from "prop-types"
import Menu, {SubMenu, MenuItem} from '../Menu';
import Icon from '../Icon';
import ReactDOM from 'react-dom';

export default class RowOverflowMenu extends Component {
  static propTypes = {
	overflowMenu: PropTypes.array,
	hoverDivStyle:PropTypes.any,
	rowActionMenu:PropTypes.any,
	isHovered:PropTypes.any
  }

  constructor(props) {
	super(props);
	this.state = {intialLoad: false, showRowHoverMenu: false};
  }

  componentWillReceiveProps(nextProps) {
	const {isHovered} = nextProps;
	if(isHovered) this.setState({intialLoad: true});
  }

  showHoverMenu = (e) => {
	e.stopPropagation();
	const val = this.state.showRowHoverMenu ? false : true;
	this.setState({showRowHoverMenu: val});
  }

  onHide = () => {
		this.setState({showRowHoverMenu: false});
	}

  render() {
		const {hoverDivStyle, rowActionMenu, isHovered} = this.props;
		const {showRowHoverMenu, intialLoad} = this.state;
		//const rowHoverMenuContent = ();
		return (
				<span
					className="rowHoverDiv"
					ref="rowHoverTarget"
					style={hoverDivStyle}
					onClick={this.showHoverMenu}
				>
					<Icon name='more' color= {isHovered ? '#2f749a' : 'transparent'}  />
					{intialLoad ? (
						<Menu
							flexHeader
							target={() => ReactDOM.findDOMNode(this.refs.rowHoverTarget)}
							show={showRowHoverMenu}
							onHide={this.onHide}
						>
						{rowActionMenu}
					</Menu>) : null}

				</span>
		);
	}
}
