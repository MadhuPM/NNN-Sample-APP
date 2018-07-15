import React, {Component} from 'react';
import PropTypes from 'prop-types'
import ReactDOM from 'react-dom';
import raf from 'raf';
import { Scrollbars } from 'react-custom-scrollbars';

const isEqualSubset = (a, b) => {
  for (const key in a) if (a[key] !== b[key]) return false;
  return true;
};

const isEqual = (a, b) => isEqualSubset(a, b) && isEqualSubset(b, a);

export default class extends Component {
  static displayName = 'Scroller';

  static propTypes = {
    initialIndex: PropTypes.number,
    itemSizeGetter: PropTypes.func,
    itemRenderer: PropTypes.func,
    itemsRenderer: PropTypes.func,
    length: PropTypes.number,
    pageSize: PropTypes.number,
    threshold: PropTypes.number,
    type: PropTypes.oneOf(['variable', 'uniform']),
    useTranslate3d: PropTypes.bool,
    rowHeight: PropTypes.oneOfType([PropTypes.func, PropTypes.number]),
    showPage: PropTypes.func,
    scrollLimit: PropTypes.number,
    customScrollSync:PropTypes.func
  };

  static defaultProps = {
    initialIndex: null,
    itemSizeGetter: null,
    itemRenderer: (index, key) => <div key={key}>{index}</div>,
    itemsRenderer: (items, ref) => <div ref={ref}>{items}</div>,
    length: 0,
    pageSize: 20,
    threshold: 100,
    type: 'uniform',
    useTranslate3d: true,
    rowHeight: 50
  };

  constructor(props) {
    super(props);
    const {initialIndex, length, pageSize} = props;
    const from = this.constrainFrom(initialIndex, length);
    const size = this.constrainSize(pageSize, length, pageSize, from);
    this.state = {from, size};
    this.cache = {};
    this.pageNo = 1;
  }


  componentDidMount() {
    this.scrollParent = this.getScrollParent();
    this.updateFrame = this.updateFrame.bind(this);
    window.addEventListener('resize', this.updateFrame);
    this.scrollParent.addEventListener('scroll', this.updateFrame);
    this.updateFrame();
    const {initialIndex} = this.props;
    if (initialIndex === null) return;
    this.afId = raf(this.scrollTo.bind(this, initialIndex));
  }

  componentWillReceiveProps(next) {
    let {from, size} = this.state;
    const {length, pageSize, params, limit, scrollLimit} = next;
    from = this.constrainFrom(from, length);
    size = this.constrainSize(size, length, pageSize, from);
    let paramArray = (Array.isArray(params) ? params : [params]).slice();
    //const start = paramArray[0] ? paramArray[0].start || paramArray[0].START : undefined;
    let start = undefined;
    if(paramArray[0]) {
      if(paramArray[0].start !== undefined) {
        start = paramArray[0].start;
      } else if (paramArray[0].START !== undefined) {
        start = paramArray[0].START;
      }
    }

    const customLimit = limit || scrollLimit;
    this.pageNo = !isNaN(start) && (!isNaN(customLimit) && customLimit > 0) ? (start / customLimit) + 1 : this.pageNo;
    this.setState({from, size});
  }

  shouldComponentUpdate(props, state) {
    return !isEqual(props, this.props) || !isEqual(state, this.state);
  }

  // componentDidUpdate() {
  //   this.updateFrame();
  // }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateFrame);
    this.scrollParent.removeEventListener('scroll', this.updateFrame);
    raf.cancel(this.afId);
  }

  getScrollParent() {
    let el = ReactDOM.findDOMNode(this);
    // eslint-disable-next-line
    while (el = el.parentElement) {
      if (el.className === 'dataGridScroller') {
        return el;
      }
    }
    return window;
  }

  getScroll() {
    const {scrollParent} = this;
    //const elStart = ReactDOM.findDOMNode(this).getBoundingClientRect()['top'];
    const elStart = ReactDOM.findDOMNode(this.containerDiv)
    .getBoundingClientRect().top;
    const scrollParentStart = scrollParent.getBoundingClientRect()['top'];
    const scrollParentClientStart = scrollParent['clientTop'];
    return scrollParentStart + scrollParentClientStart - elStart;
  }

  setScroll(offset) {
    const {scrollParent} = this;
    scrollParent['scrollTop'] += offset - this.getScroll();
  }

  getViewportSize() {
    const {scrollParent} = this;
    return scrollParent['clientHeight'];
  }

  getStartAndEnd() {
    const {threshold} = this.props;
    const start = Math.max(0, this.getScroll() - threshold);
    const end = start + this.getViewportSize() + (threshold * 2);
    return {start, end};
  }

  getSizeOf(index) {
    // Try the static itemSize.
    const {itemSize} = this.state;
    if (itemSize) return itemSize;

    // Try the itemSizeGetter.
    const {itemSizeGetter} = this.props;
    if (itemSizeGetter) return itemSizeGetter(index);

    // Try the cache.
    const {cache} = this;
    if (cache[index]) return cache[index];

    // We don't know the size.
    return NaN;
  }

  getSpaceBefore(index) {
    // Try the static itemSize.
    const {itemSize} = this.state;
    if (itemSize) return index * itemSize;

    // Finally, accumulate sizes of items 0 - index.
    let space = 0;
    for (let i = 0; i < index; ++i) {
      const size = this.getSizeOf(i);
      if (isNaN(size)) break;
      space += size;
    }
    return space;
  }

  updateFrame(e) {
    if(e && this.props.customScrollSync) {
      this.props.customScrollSync(e.target.scrollLeft);
    }
    // return this.updateUniformFrame();
    switch (this.props.type) {
    case 'uniform': return this.updateUniformFrame();
    case 'variable': return this.updateVariableFrame();
    default: break;
    }
  }

  updateVariableFrame() {
    if (!this.props.itemSizeGetter) this.cacheSizes();

    const {start, end} = this.getStartAndEnd();
    const {length, pageSize, showPage, scrollLimit, limit} = this.props;
    let space = 0;
    let from = 0;
    let size = 0;
    const maxFrom = length - 1;

    while (from < maxFrom) {
      const itemSize = this.getSizeOf(from);
      if (isNaN(itemSize) || space + itemSize > start) break;
      space += itemSize;
      ++from;
    }

    const maxSize = length - from;

    while (size < maxSize && space < end) {
      const itemSize = this.getSizeOf(from + size);
      if (isNaN(itemSize)) {
        size = Math.min(size +pageSize, maxSize);
        break;
      }
      space += itemSize;
      ++size;
    }
    const customLimit = scrollLimit || limit;
    if(customLimit > pageSize - 1 && size > 0) {
			if(size < pageSize) {
				const currentPage = Math.ceil(from/customLimit) + 1;
				if(currentPage > this.pageNo) {
          this.pageNo = currentPage;
					showPage(this.pageNo)
				}
			}
		}

		if(customLimit <= pageSize - 1 && size > 0) {
			if(size < customLimit && this.pageNo === 1) {
				this.pageNo ++;
				showPage(this.pageNo);
			} else if(size < pageSize){
				const currentPage = Math.ceil(from/customLimit) + 1;
				if(currentPage > this.pageNo) {
          this.pageNo = currentPage;
					showPage(this.pageNo)
				}
			}
		}

    this.setState({from, size});
  }


  updateUniformFrame() {
    const {length, pageSize, showPage, scrollLimit, rowHeight, limit} = this.props;
    const itemSize = rowHeight;
    const {start, end} = this.getStartAndEnd();
    const from = this.constrainFrom(Math.floor(start / itemSize), length);
    const size = this.constrainSize((Math.ceil((end - start) / itemSize) + 1), length, pageSize, from);
    const customLimit = scrollLimit || limit;

    if(customLimit > pageSize - 1 && size > 0) {
			if(size < pageSize) {
        const currentPage = Math.ceil(from/customLimit) + 1;
				if(currentPage - this.pageNo === 1 ) {
					this.pageNo = currentPage;
					showPage(this.pageNo)
				}
			}
		}

		if(customLimit <= pageSize - 1 && size > 0) {
			if(size < customLimit && this.pageNo === 1) {
        this.pageNo ++;
				showPage(this.pageNo);
			} else if(size < pageSize){
        const currentPage = Math.ceil(from/customLimit) + 1;
				if(currentPage - this.pageNo === 1) {
					this.pageNo = currentPage;
					showPage(this.pageNo)
				}
			}
		}

    this.setState({from, itemSize, size});
  }

  // cacheSizes() {
  //   const {cache} = this;
  //   const {from} = this.state;
  //   const itemEls = this.items.children[1].children;
  //   for (let i = 0, len = itemEls.length; i < len; ++i) {
  //     cache[from + i] = itemEls[i].getBoundingClientRect()['height'];
  //   }
  // }

  constrainFrom(from, length) {
    if (!from) return 0;
    return Math.max(Math.min(from, length), 0);
  }

  constrainSize(size, length, pageSize, from) {
    return Math.min(Math.max(size, pageSize), length - from);
  }

  scrollTo(index) {
    this.setScroll(this.getSpaceBefore(index));
  }

  renderItems() {
    const {from, size} = this.state;
    const items = [];
    const fixedItems = [];
    let item;
    for (let i = 0; i < size; ++i) {
      item = this.props.itemRenderer(from + i, i);
      fixedItems.push(item[0]);
      items.push(item[1]);
    }
    const itemArray = [fixedItems, items];
    return this.props.itemsRenderer(itemArray, c => { this.items = c; });
  }

  render() {
    const items = this.renderItems();
    const {useTranslate3d} = this.props;
    const style = {position: 'absolute'};
    const size = this.getSpaceBefore(this.props.length);
    style['height'] = size;
    const offset = this.getSpaceBefore(this.state.from);
    const x = 0;
    const y = offset;
    const transform =
      useTranslate3d ?
      `translate3d(${x}px, ${y}px, 0)` :
      `translate(${x}px, ${y}px)`;
    const listStyle = {
      MsTransform: transform,
      WebkitTransform: transform,
      transform,
      position: 'absolute'
    };
    return (
      <Scrollbars
        onScroll={this.updateFrame}
        renderTrackHorizontal={props => <div {...props} className="track-horizontal"/>}
        renderTrackVertical={props => <div {...props} className="track-vertical"/>}
      >
        <div {...{style}}  ref={c => this.containerDiv = c}>
          <div style={listStyle}>{items}</div>
        </div>
      </Scrollbars>
    );
  }
}
