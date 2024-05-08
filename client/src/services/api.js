// api.js

import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

const date = new Date();

export const fetchStocks = async () => {
  try {
    const response = await axios.get(API_BASE_URL);
    return response.data;
  } catch (error) {
    console.error(error);
    throw new Error('Failed to fetch stocks');
  }
};

export const fetchStocksBySymbol = async symbol => {
  try {
    const response = await axios.get(`${API_BASE_URL}/?symbols=${symbol}`);
    return response.data;
  } catch (error) {
    console.error(error);
    throw new Error('Failed to fetch stocks');
  }
};

export const fetchHistoricalData = async (
  symbol,
  from_date = '2002-05-11',
  to_date = date.toLocaleDateString('en-CA'),
) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/historical_stock_data`, {
      params: {
        symbol: symbol,
        from_date: from_date,
        to_date: to_date,
      },
    });
    return response.data;
  } catch (error) {
    console.error(error);
    throw new Error('Failed to fetch historical data');
  }
};

export const addStock = async symbol => {
  try {
    const response = await axios.post(`${API_BASE_URL}/add_stock`, {
      stock_symbol: symbol,
    });
    return response.data;
  } catch (error) {
    console.error(error);
    throw new Error('Failed to add stock');
  }
};
export const removeStock = async symbol => {
  try {
    const response = await axios.post(`${API_BASE_URL}/remove_stock`, {
      stock_symbol: symbol,
    });
    return response.data;
  } catch (error) {
    console.error(error);
    throw new Error('Failed to add stock');
  }
};
