import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactDom from 'react-dom';
import classnames from 'classnames';
import {Scrollbars} from 'react-custom-scrollbars'

class Select extends Component {
  static propTypes = {
    prefixCls: PropTypes.string,
    options: PropTypes.array,
    selectedIndex: PropTypes.number,
    type: PropTypes.string,
    onSelect: PropTypes.func,
    onMouseEnter: PropTypes.func,
  };

  state = {
    active: false,
  };
  
  componentDidMount(){
    // console.log(this,"))))))))))))))))))")
  }

  componentWillReceiveProps(nextProps) {
    const { selectedIndex } = nextProps;
    if (selectedIndex !== -1) {
      // console.log(nextProps, 'lllllllllllllllllllllllll')
      // this.setState({
      //     minuteIndex,
      // });
    }
  }

  componentDidUpdate(prevProps) {
    // smooth scroll to selected option
    if (prevProps.selectedIndex !== this.props.selectedIndex) {
      // this.scrollToSelected(120);
    }
  }

  onSelect = (value) => {
    const { onSelect, type } = this.props;
    onSelect(type, value);
    this.scroll.scrollToTop()
  }
  
  handleMouseLeave = ()=>{
    this.scroll.scrollToTop()
  }

  getOptions() {
    const { options, selectedIndex, prefixCls,initWithoutClick } = this.props;
    if (selectedIndex === -1) {
      return options.map((item, index) => {
        const cls = classnames({
          [`${prefixCls}-select-option-disabled`]: item.disabled,
        });
        let onclick = null;
        if (!item.disabled) {
          onclick = this.onSelect.bind(this, item.value);
        }
        return (<li
          className={cls}
          key={index}
          onClick={onclick}
          disabled={item.disabled}
        >
          {item.value}
        </li>);
      });
    }
    var head = options.concat()
    var tail = head.splice(selectedIndex)
    const newOptions = tail.concat(head)

    return newOptions.map((item, index) => {
      const cls = classnames({
        [`${prefixCls}-select-option-selected`]: index === 0,
        [`${prefixCls}-select-option-disabled`]: item.disabled,
      });
      let onclick = null;
      if (!item.disabled) {
        onclick = this.onSelect.bind(this, item.value);
      }
      return (<li
        className={cls}
        key={index}
        onClick={onclick}
        disabled={item.disabled}
      >
        {item.value}
      </li>);
    });
  }
  
  scrollbar=(node)=>{
    this.scroll = node
  }
  render() {
    if (this.props.options.length === 0) {
      return null;
    }

    const { prefixCls } = this.props;
    const cls = classnames({
      [`${prefixCls}-select`]: 1,
      [`${prefixCls}-select-active`]: this.state.active,
    });

    return (
      <Scrollbars
        ref={this.scrollbar}
        className={cls}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
        autoHide
        style={{
          height: '190px',
          width: '42.5px',
          overflowX: 'hidden'
        }}
        renderTrackHorizontal={props => <div/>}
        renderView={props => <div {...props} className="view"/>}
      >
        <ul >
          {this.getOptions()}
        </ul>
      </Scrollbars>
    );
  }
}

export default Select;
