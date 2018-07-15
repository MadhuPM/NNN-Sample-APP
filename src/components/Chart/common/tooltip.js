import React from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import { animationFrame } from './util'


export class ToolTip extends React.Component {
    static defaultProps = {
        role: 'tooltip',
        display: false, // if false, component will not be in DOM
        show: false, // if false, component will not be visible
        traceMouse: false,
        content: <div></div>,
        yOffset: 25
    }
    
    static propTypes = {
        display: PropTypes.bool,
        show: PropTypes.bool,
        role: PropTypes.oneOf(['tooltip']),
        traceMouse: PropTypes.bool,
        content: PropTypes.element,
        yOffset: PropTypes.number
    }

    constructor(props) {
        super(props)
        this.ref = null
        this.state = {
            x: null,
            y: null,
            top: 0,
            left: 0,
            show: props.show
        }
        this.update = this.update.bind(this)
        this.onMouseMove = this.onMouseMove.bind(this)
    }

    componentDidMount() {
        window.addEventListener('mousemove',this.onMouseMove)
    }

    componentWillUnmount() {
        window.removeEventListener('mousemove',this.onMouseMove)
    }

    get left() {
        let result = 0
        if(this.rect && this.clientX) {
            let halfWidth = this.rect.width / 2

            if(this.clientX < halfWidth) {
                result = halfWidth - this.clientX
            }
            else if(window.innerWidth - this.clientX < halfWidth) {
                result = window.innerWidth - this.clientX - halfWidth
            }
            
        }
        return result
    }

    get top() {
        let result = 0
        if(this.rect && this.clientY) {
            if(this.clientY < this.rect.height + this.props.yOffset) {
                result = this.rect.height + this.props.yOffset - this.clientY
            }
        }
        return result
    }

    getRect() {
        if(this.state.x && this.state.y && this.state.show && !this.rect) {
            setTimeout(() => {
                let { top, right, bottom, left } = this.ref.getBoundingClientRect()
                this.rect = {
                    width: right - left,
                    height: bottom - top
                }
                this.setState({
                    left: this.left,
                    top: this.top
                })
            }, 200);
        }
    }

    update(x = null, y = null) {
        animationFrame(() => {
            this.setState(preState => ({
                x: x != null ? x : preState.x,
                y: y != null ? y && y - this.props.yOffset : preState.y,
                show: preState.x && preState.y && this.props.show,
                left: this.left,
                top: this.top
            }), () => {
                this.getRect()
            })
        })
    }

    onMouseMove(evt) {
        if(this.props.show === false && this.state.show === false) {
            return
        }
        
        let { clientX, clientY } = evt
        this.clientX = clientX
        this.clientY = clientY

        setTimeout(() => {
            this.update(clientX, clientY)
        })
    }

    

    render() {
        let { traceMouse, display } = this.props
        let { top, left, x, y, show } = this.state

        let className = classnames({
            ['ssd-chart-tooltip']: true,
            show: show,
            traceMouse: traceMouse
        })

        return (
            display &&
            <div ref={ref => this.ref = ref} 
                className={className}
                style={{left:x, top:y}}
            >
                <div className='tooltip-content' style={{ top: top, left: left }}>
                    {this.props.content}
                </div>
            </div>
        )
    }
}