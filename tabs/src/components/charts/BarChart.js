import React, { Component } from 'react';
import Chart from "react-google-charts";
import "./Chart.css";

class BarChart extends Component {

    render() {
        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = today.getFullYear();

        today = mm + '/' + dd + '/' + yyyy;

        var arrayResult = [];
        if(this.props.userId){
            arrayResult = this.props.arr;
        }else{
            arrayResult = [
                ["", "Done", "Undone"],
                [today, 10, 10],
                [today, 0, 0],
                [today, 0, 0],
                [today, 0, 0],
              ];
        }

        return (
            <div className='BarChart'>
                <h2>
                    Checklist status of day by day
                </h2>
                <Chart
                    width={'500px'}
                    height={'500px'}
                    chartType="Bar"
                    loader={<div>Loading Bar Chart</div>}
                    data={arrayResult}
                    options={{
                        hAxis: { titleTextStyle: { color: '#333' } },
                        vAxis: { minValue: 0 },
                        chartArea: { width: '50%', height: '50%' },
                    }}
                />
            </div>
        );
    }
}


export default BarChart;