import React, { Component } from 'react';
import _ from 'lodash';
import { Form, FormGroup, ControlLabel, FormControl, HelpBlock, Table } from 'react-bootstrap';
import funds from './data/funds.json';

function FieldGroup({ id, label, help, ...props }) {
    return (
        <FormGroup controlId={id}>
            {label && <ControlLabel>{label}</ControlLabel>}
            <FormControl {...props} />
            {help && <HelpBlock>{help}</HelpBlock>}
        </FormGroup>
    );
}

class FundTable extends Component {
    constructor() {
        super();
        this.state = {
            "time": ""
        }
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange = (e) => {
        const target = e.currentTarget;
        this.setState({
            [target.name]: target.value
        })
    }

    render() {
        const first_100_funds = _.slice(funds, 0, 100);
        const { time } = this.state;
        const data = first_100_funds.filter(fund => {
            if (time != "")
                return fund.Predicted_Time.indexOf(time) > -1 || fund.AlertTime.indexOf(time) > -1 || fund.Max_PredictedTime.indexOf(time) > -1;
            else
                return true;
        }).map((fund) => {
            return (
                <tr>
                    <th scope="row">{fund.No + 1}</th>
                    <td>{fund.FUND_ID}</td>
                    <td>{fund.Predicted_Time}</td>
                    <td>{fund.AlertTime}</td>
                    <td>{fund.Max_PredictedTime}</td>
                </tr>
            );
        });

        return (
            <div className="App">
                <h1 className="App-title">Funds</h1>
                <Form inline>
                    <FieldGroup
                        id="time"
                        name="time"
                        type="text"
                        placeholder="Search Funds"
                        value={this.state.time}
                        onChange={this.handleChange}
                    />
                </Form>
                <Table bordered striped>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Funds</th>
                            <th>Predicted Time</th>
                            <th>Alert Time</th>
                            <th>Max Predicted Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data}
                    </tbody>
                </Table>
            </div>
        );
    }
}

export default FundTable;
