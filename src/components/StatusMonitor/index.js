import React, { Component } from 'react';
import PropTypes from 'prop-types'
import { ListGroup, ListGroupItem, Image } from 'react-bootstrap';
import classNames from 'classnames'

export default class StatusMonitor extends Component {
    static propTypes = {
        data: PropTypes.array.isRequired,
        className: PropTypes.string,
        onClick: PropTypes.func.isRequired
    }

    static defaultProps = {
        data: []
    }

    itemClick = (index) => {
        const { data, onClick } = this.props

        const clickedStatusArray = data.map((item, idx) => {
            return  index === idx ? {...item, selected: !item.selected } : item
          })
        onClick(clickedStatusArray[index], clickedStatusArray)
    }

    render() {
        const { data, className} = this.props
        let classname = classNames('design2-statusMonitor',className)
        
        const listItems = data.map((obj, index) => {
            let listGroupItemClass = ''
            let statusSymbolClass = 'statusSymbol'
            let statusLabelClass = 'statusLabel'
            if (obj.priority === 'HIGH') {
                statusLabelClass = classNames('highPriority',statusLabelClass)
                statusSymbolClass = classNames('highPriority',statusSymbolClass)
            }
            //get true means the item was clicked
            if (obj.selected) {
                listGroupItemClass = 'selected'
                if (obj.priority !== 'HIGH') {
                    statusLabelClass = classNames('selected',statusLabelClass)
                    statusSymbolClass = classNames('selected',statusSymbolClass)
                }
            }  

            return (<ListGroupItem className={listGroupItemClass} key={index} onClick={() => this.itemClick(index)}>
                <div>
                    <p className={statusSymbolClass}>#</p>
                    <p className={statusLabelClass}>{obj.label} </p>
                </div>
            </ListGroupItem>)
        })
        return (
            <div className={classname}>
                <ListGroup>{listItems}</ListGroup>
            </div>
        )
    }

}
