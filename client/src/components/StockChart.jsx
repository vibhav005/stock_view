import { createChart } from 'lightweight-charts';
import React, { useEffect, useRef } from 'react';

const StockChart = ({ stockData }) => {
    const chartContainerRef = useRef(null);

    useEffect(() => {
        if (chartContainerRef.current && Array.isArray(stockData) && stockData.length) {
            const chart = createChart(chartContainerRef.current, { width: chartContainerRef.current.clientWidth, height: 510 });
            const candleSeries = chart.addCandlestickSeries();

            let dataForChart = stockData.map(data => ({
                time: Math.floor(new Date(data.DATE).getTime() / 1000),
                open: data.OPEN,
                high: data.HIGH,
                low: data.LOW,
                close: data.CLOSE,
            }));

            // Sort data by time in ascending order
            dataForChart.sort((a, b) => a.time - b.time);

            // Eliminate duplicate time entries
            dataForChart = dataForChart.filter((value, index, self) =>
                index === self.findIndex((t) => (
                    t.time === value.time
                ))
            );

            candleSeries.setData(dataForChart);

            return () => chart.remove();
        }
    }, [stockData]);

    return (
        <div>
            <h2>Stock Chart : {stockData[0].SYMBOL} </h2>
            <div ref={chartContainerRef} style={{ width: "100%", height: "500px" }} />
        </div>
    );
};

export default StockChart;
