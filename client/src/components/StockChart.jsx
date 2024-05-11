import Highcharts from 'highcharts/highstock';
import HighchartsTheme from 'highcharts/themes/brand-light';
import React, { useEffect, useRef } from 'react';
import { calculateRSI, findDivergencePoints } from '../utils/utility';

HighchartsTheme(Highcharts);

const processData = (stockData) => {
    return stockData.map(data => ({
        x: new Date(data.DATE).getTime(),
        open: data.OPEN,
        high: data.HIGH,
        low: data.LOW,
        close: data.CLOSE,
        volume: data.VOLUME
    })).sort((a, b) => a.x - b.x)
        .filter((value, index, self) =>
            index === self.findIndex((t) => t.x === value.x)
        );
};

const generateSeriesData = (uniqueData) => {
    const ohlc = uniqueData.map(data => [data.x, data.open, data.high, data.low, data.close]);
    const volume = uniqueData.map(data => [data.x, data.volume]);

    // Calculate RSI
    const rsi = calculateRSI(uniqueData);
    const rsiData = rsi.map((value, index) => [uniqueData[index + 14].x, value]);

    // Find Divergence Points
    const divergences = findDivergencePoints(ohlc, rsiData);

    return { ohlc, volume, rsiData, divergences };
};

const initializeChart = (container, seriesData, stockSymbol) => {
    return Highcharts.stockChart(container, {
        rangeSelector: {
            selected: 1,
            buttons: [
                { type: 'week', count: 1, text: '1w' },
                { type: 'month', count: 1, text: '1m' },
                { type: 'month', count: 3, text: '3m' },
                { type: 'month', count: 6, text: '6m' },
                { type: 'year', count: 1, text: '1y' },
                { type: 'all', text: 'All' }
            ]
        },
        title: {
            text: `Stock Chart : ${stockSymbol}`
        },
        yAxis: [
            {
                labels: { align: 'right', x: -3 },
                title: { text: 'OHLC' },
                height: '40%',
                lineWidth: 2,
                resize: { enabled: true }
            },
            {
                labels: { align: 'right', x: -3 },
                title: { text: 'Volume' },
                top: '45%',
                height: '20%',
                offset: 0,
                lineWidth: 2
            },
            {
                labels: { align: 'right', x: -3 },
                title: { text: 'RSI' },
                top: '70%',
                height: '20%',
                offset: 0,
                lineWidth: 2
            }
        ],
        tooltip: {
            split: true
        },
        series: [
            {
                type: 'candlestick',
                name: stockSymbol,
                data: seriesData.ohlc
            },
            {
                type: 'column',
                name: 'Volume',
                data: seriesData.volume,
                yAxis: 1
            },
            {
                type: 'line',
                name: 'RSI',
                data: seriesData.rsiData,
                yAxis: 2
            },
            {
                type: 'line',
                name: 'Bullish Divergence',
                data: seriesData.divergences.bullish,
                yAxis: 2,
                color: 'green',
                marker: {
                    enabled: true,
                    radius: 3
                },
                dashStyle: 'ShortDash'
            },
            {
                type: 'line',
                name: 'Bearish Divergence',
                data: seriesData.divergences.bearish,
                yAxis: 2,
                color: 'red',
                marker: {
                    enabled: true,
                    radius: 3
                },
                dashStyle: 'ShortDash'
            }
        ]
    });
};

const StockChart = ({ stockData, fetchLatestStockData }) => {
    const chartContainerRef = useRef(null);
    const chartRef = useRef(null);

    useEffect(() => {
        if (chartContainerRef.current && Array.isArray(stockData) && stockData.length) {
            const uniqueData = processData(stockData);
            const seriesData = generateSeriesData(uniqueData);
            chartRef.current = initializeChart(chartContainerRef.current, seriesData, stockData[0].SYMBOL);
        }
    }, [stockData]);

    useEffect(() => {
        const intervalId = setInterval(async () => {
            const latestData = await fetchLatestStockData();
            if (latestData && chartRef.current) {
                const newProcessedData = {
                    x: new Date(latestData.DATE).getTime(),
                    open: latestData.OPEN,
                    high: latestData.HIGH,
                    low: latestData.LOW,
                    close: latestData.CLOSE,
                    volume: latestData.VOLUME
                };

                // Update the chart with new data
                const ohlcSeries = chartRef.current.series[0];
                const volumeSeries = chartRef.current.series[1];
                const rsiSeries = chartRef.current.series[2];

                ohlcSeries.addPoint([newProcessedData.x, newProcessedData.open, newProcessedData.high, newProcessedData.low, newProcessedData.close], true, true);
                volumeSeries.addPoint([newProcessedData.x, newProcessedData.volume], true, true);

                // Update RSI
                const newRSIData = calculateRSI([...ohlcSeries.data.map(p => ({
                    close: p.close
                })), newProcessedData]).slice(-1)[0];
                rsiSeries.addPoint([newProcessedData.x, newRSIData], true, true);

                // Update divergences
                const updatedRSIData = rsiSeries.data.map(p => [p.x, p.y]);
                const divergences = findDivergencePoints(ohlcSeries.data.map(p => [p.x, p.open, p.high, p.low, p.close]), updatedRSIData);
                const bullishDivergenceSeries = chartRef.current.series[3];
                const bearishDivergenceSeries = chartRef.current.series[4];

                bullishDivergenceSeries.setData(divergences.bullish, true);
                bearishDivergenceSeries.setData(divergences.bearish, true);
            }
        }, 60000); // Fetch new data every 60 seconds

        return () => clearInterval(intervalId);
    }, [fetchLatestStockData]);

    return (
        <div>
            <h2>Stock Chart</h2>
            <div ref={chartContainerRef} style={{ width: "100%", height: "70vh", marginTop: "-1rem" }} />
        </div>
    );
};

export default StockChart;
