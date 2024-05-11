import { Button, Card, CircularProgress, Grid } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { addStock, fetchHistoricalData, fetchStocks, fetchStocksBySymbol, removeStock } from '../services/api';
import StockChart from './StockChart';
import StockTable from './StockTable';

function StockList() {
    const [stocks, setStocks] = useState({});
    const [loading, setLoading] = useState(true);
    const [stockSymbols, setStockSymbols] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
    const [historicalData, setHistoricalData] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedStock, setSelectedStock] = useState(null);
    const open = Boolean(anchorEl);
    const date = new Date();

    const handleClick = (event, stockSymbol) => {
        setAnchorEl(event.currentTarget);
        setSelectedStock(stockSymbol);
    };

    const handleClose = () => {
        setAnchorEl(null);
        setSelectedStock(null);
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const data = await fetchStocks();
            setStocks(data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleFormSubmit = async event => {
        event.preventDefault();
        setLoading(true);
        try {
            const data = await fetchStocksBySymbol(stockSymbols);
            setStocks(data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const handleAddStock = async (event, symbol) => {
        event.preventDefault();
        event.stopPropagation();
        try {
            const data = await addStock(symbol);
            alert(data.message);
            fetchData();
        } catch (error) {
            console.error(error);
            alert('Failed to add stock.');
        }
    };

    const handleRemoveStock = async (event, symbol) => {
        event.preventDefault();
        event.stopPropagation();
        try {
            const data = await removeStock(symbol);
            alert(data.message);
            fetchData();
        } catch (error) {
            console.error(error);
            alert('Failed to remove stock.');
        }
    };

    const handleFetchHistoricalData = async (event, symbol) => {
        event.preventDefault();
        event.stopPropagation();
        setLoading(true);
        try {
            const data = await fetchHistoricalData(symbol, "2002-05-11", date.toLocaleDateString("en-CA"));
            setHistoricalData(data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const requestSort = key => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedStocksArray = Object.entries(stocks).sort((a, b) => {
        if (sortConfig.direction === 'asc') {
            return a[1][sortConfig.key] - b[1][sortConfig.key];
        } else {
            return b[1][sortConfig.key] - a[1][sortConfig.key];
        }
    });

    return (
        <Card style={{ margin: '5px', padding: '10px' }}>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <h1>Stock Quotes</h1>
                </Grid>
                <Grid item xs={12} md={5}>
                    <form onSubmit={handleFormSubmit}>
                        <label htmlFor="stock_symbol">Enter the stock symbol(s) (e.g., TCS, INFY): </label>
                        <input
                            type="text"
                            id="stock_symbol"
                            value={stockSymbols}
                            onChange={e => setStockSymbols(e.target.value)}
                            required
                        />
                        <Button type="submit">Get Quote</Button>
                    </form>
                    <hr />
                    {loading ? (
                        <CircularProgress color="inherit" />
                    ) : (
                        <StockTable
                            stocks={stocks}
                            sortedStocksArray={sortedStocksArray}
                            sortConfig={sortConfig}
                            requestSort={requestSort}
                            anchorEl={anchorEl}
                            open={open}
                            handleClick={handleClick}
                            handleClose={handleClose}
                            handleAddStock={handleAddStock}
                            handleRemoveStock={handleRemoveStock}
                            handleFetchHistoricalData={handleFetchHistoricalData}
                            selectedStock={selectedStock}
                            fetchData={fetchData}
                            refreshInterval={100000}
                        />
                    )}
                </Grid>
                <Grid item xs={12} md={7}>
                    {historicalData && <StockChart stockData={historicalData} />}
                </Grid>
            </Grid>
        </Card>
    );
}

export default StockList;
