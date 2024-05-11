// utils.js

export const calculateRSI = (data, period = 14) => {
  let gains = [];
  let losses = [];

  for (let i = 1; i < data.length; i++) {
    const change = data[i].close - data[i - 1].close;
    if (change > 0) {
      gains.push(change);
      losses.push(0);
    } else {
      gains.push(0);
      losses.push(Math.abs(change));
    }
  }

  const averageGain = gains.slice(0, period).reduce((acc, val) => acc + val, 0) / period;
  const averageLoss = losses.slice(0, period).reduce((acc, val) => acc + val, 0) / period;

  let rsi = [100 - 100 / (1 + averageGain / averageLoss)];
  let currentGain = averageGain;
  let currentLoss = averageLoss;

  for (let i = period; i < gains.length; i++) {
    currentGain = (currentGain * (period - 1) + gains[i]) / period;
    currentLoss = (currentLoss * (period - 1) + losses[i]) / period;

    if (currentLoss === 0) {
      rsi.push(100);
    } else {
      const rs = currentGain / currentLoss;
      rsi.push(100 - 100 / (1 + rs));
    }
  }

  return rsi;
};

export const findDivergencePoints = (ohlcData, rsiData) => {
  const divergences = {
    bullish: [],
    bearish: [],
  };

  for (let i = 1; i < rsiData.length; i++) {
    if (rsiData[i][1] > rsiData[i - 1][1] && ohlcData[i][4] < ohlcData[i - 1][4]) {
      divergences.bullish.push(rsiData[i]);
    } else if (rsiData[i][1] < rsiData[i - 1][1] && ohlcData[i][4] > ohlcData[i - 1][4]) {
      divergences.bearish.push(rsiData[i]);
    }
  }

  return divergences;
};
