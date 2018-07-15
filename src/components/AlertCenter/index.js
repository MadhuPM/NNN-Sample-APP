import React, { Component } from "react"
import PropTypes from 'prop-types'
import {Tabs, Tab } from "react-bootstrap"
import ListItem from './ListItem'
import classnames from 'classnames'

export default class AlertCenter extends Component {
    static type='AlertCenter'
    static defaultProps = {
        keyField: 'id',
        data: {},
        onClickTitle:()=>{},
        onTitleClick:()=>{},
        onClickLink:()=>{},
        onShowAll:()=>{},
        markAsRead:()=>{},
        onMarkAsRead:()=>{}
    }
    static propTypes = {
        className: PropTypes.string,
        style:PropTypes.object,
        data: PropTypes.object,
        active: PropTypes.string,
        showAllName: PropTypes.string,
        keyField: PropTypes.string,
        charLimit: PropTypes.number,
        overflowMenu: PropTypes.func,
        onClickTitle: PropTypes.func,
        onTitleClick: PropTypes.func,
        onClickLink: PropTypes.func,
        onShowAll: PropTypes.func,
        markAsRead: PropTypes.func,
        onMarkAsRead: PropTypes.func
    }
    constructor(props) {
        super(props)
        this.state = {
            key: props.active||Object.keys(props.data)[0]
        }
        this.data = this.sortByTime(props.data)
    }
    componentWillReceiveProps(nextProps){
        if(nextProps.data){
            this.data = this.sortByTime(nextProps.data)
        }
    }
    handleSelect = (key) => {
        this.setState({
            key
         })
    }
    sortByTime(m){
        for (let k in m) {
            m[k].sort((a,b)=> b.time-a.time)
        }
        return m
    }
    handleTitle = (key) => {
        const number= this.data[key].filter(function (d) {
            return !d.isRead
        }).length
        return `${key.charAt(0).toUpperCase()+key.slice(1)} (${number})`
    }
    onMarkAsRead = (id) => {
        const {key} = this.state
        const {markAsRead,onMarkAsRead}= this.props

        markAsRead||onMarkAsRead?markAsRead(key,id)||onMarkAsRead(key,id):null
    }
    onTitleClick=(id)=>{
        const {key} = this.state
        const {onClickTitle,onTitleClick}= this.props
        onClickTitle||onTitleClick?onClickTitle(key,id)||onTitleClick(key,id):null
    }

    renderChild = () => {
        const {key}= this.state
        const {showAllName,onClickLink,onShowAll,keyField,charLimit,overflowMenu}= this.props
        
        return (
            <ul className="design2-alertcenter-list">
                {this.data[key].slice(0, 8).map((message) => {
                    return (
                        <ListItem 
                            key={key+message[keyField]}
                            type={key}
                            charLimit={charLimit}
                            keyField={keyField}
                            msg={message} 
                            onMarkAsRead={this.onMarkAsRead}
                            onTitleClick={this.onTitleClick}
                            overflowMenu={overflowMenu}
                        />
                    )
                    
                })}
                <a 
                    onClick={onClickLink||onShowAll?()=>onClickLink()||onShowAll():null} 
                    className={classnames("alertcenter-link",{'hide':this.data[key].length<8})}
                >
                    {showAllName?showAllName:`See All ${key.charAt(0).toUpperCase()+key.slice(1)}`}
                </a>
            </ul>
        )
    }

    render() {
        const {key}= this.state
        const {className,style,data,keyField,charLimit,showAllName,overflowMenu,onClickTitle,onTitleClick,markAsRead,onMarkAsRead,
            onClickLink,onShowAll,...props}= this.props
        const tabArray = Object.keys(data)

        return (
                <Tabs activeKey={key} onSelect={this.handleSelect} id="controlled-tab-design2" className={classnames("design2-alertcenter",className)} style={{...style}} {...props}>
                    {
                        tabArray.map((item, index) => {
                            return (<Tab key={index} eventKey={item} title={this.handleTitle(item)} tabClassName="design2-alertcenter-tab">
                                {this.renderChild()}
                            </Tab>)
                        })
                        
                    }
                </Tabs>
        )
    }

}
