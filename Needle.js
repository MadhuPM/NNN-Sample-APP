class Needle extends React.Component {
    static propTypes = {
        percent: React.PropTypes.number,
        length: React.PropTypes.number,
        radius: React.PropTypes.number,
        transform: React.PropTypes.string
    };

    percentToDeg = (perc) => {
        return perc * 360;
    };
    
    percentToRad = (perc) => {
        return this.degToRad(this.percentToDeg(perc));
    };

    degToRad = (deg) => {
        return deg * Math.PI / 180;
    };

    getNeedlePath = () => {
        const thetaRad = this.percentToRad(this.props.percent) / 2;

        const centerX = 0;
        const centerY = 0;

        const topX = centerX - this.props.length * Math.cos(thetaRad);
        const topY = centerY - this.props.length * Math.sin(thetaRad);

        const leftX = centerX - this.props.radius * Math.cos(thetaRad - Math.PI / 2);
        const leftY = centerY - this.props.radius * Math.sin(thetaRad - Math.PI / 2);

        const rightX = centerX - this.props.radius * Math.cos(thetaRad + Math.PI / 2);
        const rightY = centerY - this.props.radius * Math.sin(thetaRad + Math.PI / 2);
        return `M ${leftX} ${leftY} L ${topX} ${topY} L ${rightX} ${rightY}`;
    };

    render() {
        const path = this.getNeedlePath();
        return (
            <g transform={this.props.transform}>
                <path className="needle" d={path}/>
                <circle className="needle-center" cx="0" cy="0" r={this.props.radius}/>
            </g>
        );
    }
}