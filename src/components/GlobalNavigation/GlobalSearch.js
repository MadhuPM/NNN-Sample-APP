import React, {Component} from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import Search from '../Search'

export default class GlobalSearch extends Component {
    static propTypes = {
        children: PropTypes.any
    }
    static type='GlobalSearch'
    render() {
        let {...props} = this.props
        return (<Search global
            {...props}
                />)
    }
}
