import React, {Component} from 'react';
import { PropTypes } from "prop-types";
import cx from 'classnames';

export default class VerticalLayout extends Component {
  static propTypes = {
    children: PropTypes.node,
    flex: PropTypes.oneOf(['fixed', 'flex']),
    style: PropTypes.object,
    width: PropTypes.any,
    height: PropTypes.any
  };

  render() {
    const {flex, style, width, height, children} = this.props;
    const classes = cx('design2_flexContainerCol',
      {design2_flexNav: flex === 'fixed', design2_flexMain: flex === 'flex'});

    const layoutStyle = {...style};

    if (width) {
      layoutStyle.width = width;
    }

    if (height) {
      layoutStyle.height = height;
    }

    return (

      <div {...this.props} className={classes} style={layoutStyle}>
       {children}
      </div>
    );
  }
}
