// StockForm.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchStocksBySymbol } from '../services/api';

function StockForm() {
    const [stockSymbols, setStockSymbols] = useState('');
    const [stocks, setStocks] = useState({});

    const navigate = useNavigate();

    const handleFormSubmit = async (event) => {
        event.preventDefault();
        try {
            const data = await fetchStocksBySymbol(stockSymbols);
            setStocks(data);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div>
            <h1>Stock Quotes</h1>
            <form onSubmit={handleFormSubmit}>
                <label htmlFor="stock_symbol">Enter the stock symbol(s) (e.g., TCS,INFY) : </label>
                <input type="text" id="stock_symbol" value={stockSymbols} onChange={(e) => setStockSymbols(e.target.value)} required />
                <button type="submit">Get Quote</button>
            </form>
        </div>
    );
}

export default StockForm;
