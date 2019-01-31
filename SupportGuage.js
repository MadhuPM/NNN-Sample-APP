class SupportGuage extends React.Component {
    static propTypes = {
        guageData: React.PropTypes.array,
        width: React.PropTypes.number,
        height: React.PropTypes.number,
        sections: React.PropTypes.array
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

    renderSections = () => {
        const margin = { left: 50, right: 50, top: 100, bottom: 100 };

        const width = Math.round(this.props.width - (margin.left + margin.right));
        const height = Math.round(this.props.height - (margin.top + margin.bottom));

        const radius = Math.min(this.props.width, this.props.height) / 2;
        const sectionPerc = 1 / this.props.sections.length / 2;
        const padRad = 0.05;

        let totalPercent = 0.75;
        const chartInset = 10;
        const barWidth = 20;

        return this.props.sections.map((sectionProps, index) => {
            const arcStartRad = this.percentToRad(totalPercent);
            const arcEndRad = arcStartRad + this.percentToRad(sectionPerc);
            totalPercent += sectionPerc;

            const startPadRad = index === 0 ? 0 : padRad / 2;
            const endPadRad = index === this.props.sections.length ? 0 : padRad / 2;

            const transform = `translate(${this.props.width / 4}, ${height / 2})`;

            return (
                <Radial
                    key={index + '_radial'}
                    transform={transform}
                    {...sectionProps}
                    width={width}
                    height={height}
                    innerRadius={radius - chartInset - barWidth}
                    outerRadius={radius - chartInset}
                    startAngle={arcStartRad + startPadRad}
                    endAngle={arcEndRad - endPadRad}
                />);
        });
    };

    render() {
        const needleTransform = () => {
            return `translate(${(this.props.width) / 2}, ${(this.props.height) / 2})`;
        };

        return (
            <div>
                <svg width={this.props.width} height={this.props.height} >
                    {
                        this.renderSections()
                    }
                    <Needle percent={0.75} length={80} radius={15} transform={needleTransform()}/>
                </svg>
            </div>
        );
    }
}