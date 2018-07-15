import React, {Component} from 'react';
import PropTypes from 'prop-types'
import raf from 'raf';
import getScrollbarWidth from './getScrollbarWidth';

const scrollBarWidth = getScrollbarWidth();

export default function autoResize(WrappedComponent) {
  const displayName =
      WrappedComponent.displayName ||
      WrappedComponent.name ||
      'Component';

  class AutoResize extends Component {
    static propTypes = {
      children: PropTypes.node,
      height: PropTypes.number,
      width: PropTypes.number,
      onResize: PropTypes.func
    };

    static displayName = `AutoResize(${displayName})`;

    constructor(props) {
      super(props);
      const {height = 0, width = 0} = props;
      this.lastDimensions = {width: null, height: null};
      this.state = {height, width};
    }


    componentDidMount() {
      this.resetTriggers();
      this.initialResetTriggersTimeout = setTimeout(this.resetTriggers, 1000);
    }


    componentDidUpdate() {
      this.resetTriggers();
    }
    componentWillUnmount() {
      clearTimeout(this.initialResetTriggersTimeout);
    }

    getWrappedComponent() {
      return this.refs.child;
    }

    getDataGrid() {
      return this.refs.child;
    }
    resetTriggers = () => {
      const contract = this.contract;
      const expandChild = this.expandChild;
      const expand = this.expand;
      contract.scrollLeft = contract.scrollWidth;
      contract.scrollTop = contract.scrollHeight;
      expandChild.style.width = `${expand.offsetWidth + 1}px`;
      expandChild.style.height = `${expand.offsetHeight + 1}px`;
      expand.scrollLeft = expand.scrollWidth;
      expand.scrollTop = expand.scrollHeight;
    }

    onScroll = () => {
      if (this.r) raf.cancel(this.r);
      this.r = raf(() => {
        const dimensions = this.getDimensions();
        if (this.haveDimensionsChanged(dimensions)) {
          this.lastDimensions = dimensions;
          this.setState(dimensions);
          if (this.props.onResize) {
            this.props.onResize(dimensions);
          }
        }
      });
    }

    getDimensions() {
      let el = this.refs.resizable;

      if (!el) {
        return null;
      }

      return {
        width: Math.floor(el.offsetWidth),
        height: Math.floor(el.offsetHeight),
        scrollBarWidth
      };
    }

    haveDimensionsChanged = (dimensions) => {
      if (!dimensions) {
        return false;
      }
      return dimensions.width !== this.lastDimensions.width ||
        dimensions.height !== this.lastDimensions.height;
    }

    render() {
      const {width, height} = this.state;
      const props = {...this.props, width, height, scrollBarWidth};
      return (
        <div onScroll={this.onScroll} ref="resizable"
          style={{
            position: 'absolute', top: 0, left: 0, right: 0,
            bottom: 0, overflow: 'hidden', background: 'transparent'}}
        >
          <WrappedComponent {...props} ref='child'>
            {this.props.children}
          </WrappedComponent>
          <div className="resize-triggers" key="trigger" >
            <div className="expand-triggers" ref={(c) => { this.expand = c; }} key="expand" >
              <div ref={(c) => { this.expandChild = c; }} />
            </div>
            <div className="contract-trigger" ref={(c) => { this.contract = c; }} key="contract" />
          </div>
        </div>
      );
    }
  }
  return AutoResize;
}
