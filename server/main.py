from flask import Flask, jsonify, request
from flask_cors import CORS
from jugaad_data.nse import NSELive, stock_df
from datetime import date
import pandas as pd

app = Flask(__name__)
CORS(app)

# Define a dictionary for predefined stock symbols
predefined_stocks = {}

def format_quote(quote):
    formatted_data = {
        "CMP": quote['priceInfo']['lastPrice'],
        "Previous Close": quote['priceInfo']['previousClose'],
        "Open": quote['priceInfo']['open'],
        "Close": quote['priceInfo']['close'],
        "Lower Circuit Price": quote['priceInfo']['lowerCP'],
        "Upper Circuit Price": quote['priceInfo']['upperCP'],
        "Intraday High/Low": {
            "Min": quote['priceInfo']['intraDayHighLow']['min'],
            "Max": quote['priceInfo']['intraDayHighLow']['max'],
            "Value": quote['priceInfo']['intraDayHighLow']['value']
        },
        "52 Week High/Low": {
            "Min": quote['priceInfo']['weekHighLow']['min'],
            "Min Date": quote['priceInfo']['weekHighLow']['minDate'],
            "Max": quote['priceInfo']['weekHighLow']['max'],
            "Max Date": quote['priceInfo']['weekHighLow']['maxDate'],
            "Value": quote['priceInfo']['weekHighLow']['value']
        }
    }
    return formatted_data

def get_stock_quote(stock_symbol):
    n = NSELive()
    quote = n.stock_quote(stock_symbol)
    return format_quote(quote)

def get_historical_stock_data(symbol, from_date, to_date, series="EQ"):
    df = stock_df(symbol=symbol, from_date=from_date, to_date=to_date, series=series)
    return df

@app.route('/historical_stock_data')
def historical_stock_data():
    today = date.today()
    formatted_date = today.strftime('%Y-%m-%d')
    symbol = request.args.get('symbol', default=predefined_stocks.keys())
    from_date_str = request.args.get('from_date', default="2002-05-11")
    to_date_str = request.args.get('to_date', default=formatted_date)
    
    # Convert string dates to date objects
    from_date = date.fromisoformat(from_date_str)
    to_date = date.fromisoformat(to_date_str)

    try:
        df = get_historical_stock_data(symbol, from_date, to_date)
        return jsonify(df.to_dict(orient="records"))
    except Exception as e:
        return jsonify({"error": str(e)})

@app.route('/')
def index():
    # Check if user provided any symbols
    user_input_symbols = request.args.get('symbols')
    
    # Create a dictionary to store formatted quotes
    quotes = {}
    
    # If user provided symbols, get quotes for them
    if user_input_symbols:
        user_symbols = user_input_symbols.split(',')
        for stock_symbol in user_symbols:
            try:
                formatted_quote = get_stock_quote(stock_symbol.strip().upper())
                quotes[stock_symbol.upper()] = formatted_quote
            except Exception as e:
                # Handle exceptions if any
                quotes[stock_symbol.upper()] = f"Error: {e}"
    else:
        # If no user input, get quotes for predefined stocks
        for stock_symbol in predefined_stocks:
            try:
                quotes[stock_symbol] = predefined_stocks[stock_symbol]
            except Exception as e:
                # Handle exceptions if any
                quotes[stock_symbol] = f"Error: {e}"

    return jsonify(quotes)

@app.route('/add_stock', methods=['POST'])
def add_stock():
    data = request.json
    stock_symbol = data.get('stock_symbol')
    if stock_symbol:
        try:
            formatted_quote = get_stock_quote(stock_symbol)
            predefined_stocks[stock_symbol.upper()] = formatted_quote
            return jsonify({'success': True, 'message': f'Stock {stock_symbol} added successfully.'})
        except Exception as e:
            return jsonify({'success': False, 'message': str(e)})
    else:
        return jsonify({'success': False, 'message': 'No stock symbol provided.'})

@app.route('/remove_stock', methods=['POST'])
def remove_stock():
    data = request.json
    stock_symbol = data.get('stock_symbol')
    if stock_symbol:
        try:
            del predefined_stocks[stock_symbol.upper()]
            return jsonify({'success': True, 'message': f'Stock {stock_symbol} removed successfully.'})
        except KeyError:
            return jsonify({'success': False, 'message': f'Stock {stock_symbol} not found in the list.'})
    else:
        return jsonify({'success': False, 'message': 'No stock symbol provided.'})

if __name__ == '__main__':
    app.run(debug=True)
