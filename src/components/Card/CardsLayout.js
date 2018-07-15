import React from 'react';
import PropTypes from 'prop-types'
import { Responsive, WidthProvider } from 'react-grid-layout';

const ResponsiveReactGridLayout = WidthProvider(Responsive);

export default class CardsLayout extends React.Component {
  static defaultProps = {
    isResizable: false,
    height:30
  }
  static propTypes={
    onLayoutChange:PropTypes.func.isRequired,
    isResizable:PropTypes.bool,
    onWidthChange:PropTypes.any,
    children:PropTypes.any,
    layouts:PropTypes.any,
    height:PropTypes.any
  }
  constructor(props) {
    super(props)
    this.onLayoutChange = this.onLayoutChange.bind(this)
    this.onWidthChange = this.onWidthChange.bind(this)
    this.state = {
      layouts:{lg: this.props.layouts || React.Children.map(this.props.children,(child,i) => Object.assign({}, child.props.layout, {i:i.toString()} ))}
    } 
  }

  componentWillReceiveProps(nextProps){
    if(this.props.layouts!==nextProps.layouts){
      let newLayout = {lg: nextProps.layouts}
      this.setState({layouts:newLayout})
    }
  }
  
  onLayoutChange(layout, layouts, element) {
      this.props.onLayoutChange(layout, layouts, element)
  }
  
  onWidthChange(containerWidth, margin, cols, containerPadding){
    this.props.onWidthChange(containerWidth, margin, cols, containerPadding)
  }
  render() {
    const {height, isResizable, layouts, ...props} = this.props
    let children = React.Children.toArray(this.props.children).map( (o, i)=>{
      return React.cloneElement(o, { index: i, isDraggable: layouts?layouts[i].isDraggable:o.props.layout.isDraggable})
    })
    let childs = Array.map(children,(child, i) => <div key={i} data-grid={layouts?layouts[i]:child.props.layout}>{child}</div>)

    return (
      <ResponsiveReactGridLayout 
        className={"layout"} 
        // autoSize={true}
        compactType={'vertical'}
        layouts={this.state.layouts}
        cols={{lg: 4, md: 4, sm: 4, xs: 2, xxs: 2}}
        onLayoutChange={this.onLayoutChange} 
        onWidthChange={this.onWidthChange} 
        rowHeight={height}
        draggableCancel={".card-body"}
        isResizable={isResizable}
        margin= {[30, 30]}
      >
        {childs}
      </ResponsiveReactGridLayout>
    );
  }
}
