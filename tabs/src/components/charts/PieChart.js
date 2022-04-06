import React, { Component } from 'react';
import Chart from "react-google-charts";
import "./Chart.css";

class PieChart extends Component {
    render() {
        return (
            <div className='PieChart'>
                <h2>
                    General statistics of checklist status
                </h2>
                <Chart
                    width={'500px'}
                    height={'500px'}
                    chartType="PieChart"
                    loader={<div>Loading Pie Chart</div>}
                    data={[
                        ['Employee', 'clDone', 'clUndone'],
                        ['Done', this.props.ttlDone, this.props.ttlDone],
                        ['Undone', this.props.ttlUnDone, this.props.ttlUnDone]
                    ]}
                    options={{
                        is3D: false,
                    }}
                />
            </div>
        );
    }
}


export default PieChart;