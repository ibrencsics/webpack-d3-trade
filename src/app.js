import * as d3 from 'd3';

import CandleLoader from './modules/candleLoader';
import ChartOptions from './modules/chartOptions';

import 'js-datepicker/dist/datepicker.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './dashboard.css'
import './style2.css'

var startingDay = lastBusinessDay();
var start = Math.floor(startingDay.getTime() / 1000);
var stop = start + 86400;
var symbol;
var resolution = 5;
var chartType = "area";
var symbolType = "stock";


const candleLoader = new CandleLoader("#chartDiv");
const chartOptions = new ChartOptions("#chartOptionsDiv", selectTimeframe, selectChartType, startingDay);


var stocksToWatch = ["KO", "TSLA", "AAPL", "FB", "GOOGL", "NFLX", "NIO", "MSFT", "MA", "V", "AXP", "BA", "XPEV", "INTC", "AMD", "BABA", "ZS", "WMT", "JPM"];
createButtons("#stocks", d => selectStock(d), stocksToWatch);

var stocksToWatch2 = ["ZNGA", "RYCEF", "FSR", "SEDG", "FLSR", "JKS", "SE"]; // S92.DE
createButtons("#stocks2", d => selectStock(d), stocksToWatch2);

var cryptoToWatch = ["KRAKEN:XBTUSDT", "KRAKEN:XXBTZEUR", "KRAKEN:XXRPZEUR", "KRAKEN:XETHZEUR", "KRAKEN:XLTCZEUR", "BITFINEX:IOTUSD"];
createButtons("#crypto", d => selectCrypto(d), cryptoToWatch);

var forexToWatch = ["OANDA:EUR_USD", "OANDA:EUR_HUF", "OANDA:EUR_TRY"];
createButtons("#forex", d => selectForex(d), forexToWatch);

selectStock("KO");

function createButtons(divSelector, lambda, data) {
  var buttons = d3.select(divSelector)
    .selectAll("button")
    .data(data);
    
  buttons.enter()
    .append("button")
    .text(d => d)
    .on("click", lambda);
  
  buttons.exit()
    .remove();
}

function selectStock(symbolSel) {
  d3.select("#selected").select("p").text("Selected " + symbolSel);
  symbolType = "stock";
  symbol = symbolSel;
  load();
}

function selectCrypto(symbolSel) {
  d3.select("#selected").select("p").text("Selected " + symbolSel);
  symbolType = "crypto";
  symbol = symbolSel;
  load();
}

function selectForex(symbolSel) {
  d3.select("#selected").select("p").text("Selected " + symbolSel);
  symbolType = "forex";
  symbol = symbolSel;
  load();
}

function selectTimeframe(from, to, res) {
  start = from;
  stop = to;
  resolution = res;
  load();
}

function selectChartType(chartTypeSelected) {
  chartType = chartTypeSelected;
  load();
}

function load() {
  candleLoader.loadAndRender({"symbolType": symbolType, "symbol": symbol, "start": start, "stop": stop, "resolution": resolution, "chartType": chartType});  
}

function lastBusinessDay() {
  var now = new Date();
  var result = null;

  var offsetDay = now.getDay();
  var offsetMonth = now.getMonth();
  var offsetYear = now.getFullYear();

  console.log(offsetDay + " . " + offsetMonth + " . " + offsetYear);

  do {
    result = new Date(offsetYear, offsetMonth, offsetDay);
 
    if (offsetDay > 0) {
      offsetDay--;
    } else if (offsetMonth > 0) {
      offsetDay=30;
      offsetMonth--;
    }

  } while (0 === result.getDay() || 6 === result.getDay());

  console.log(result);
  return result;
}



// var timeFrames = [
//   {"label": "1d", "days": 1, "resolution": "5"}, 
//   {"label": "1w", "days": 7, "resolution": "60"},
//   {"label": "1m", "days": 30, "resolution": "60"},
//   {"label": "1y", "days": 365, "resolution": "D"}
// ];

// var timeFrameDiv = d3.select("#timeFrames2")
//   .selectAll("div")
//   .data(timeFrames)
//   .enter()
//   .append("div")
//   .classed("form-check", true)
//   .classed("form-check-inline", true);

// timeFrameDiv.append("input")
//   .attr("type", "radio")
//   .property("checked", (d, i) => i == 0)
//   .attr("name", "timeFrameOptions")
//   .classed("form-check-input", true)
//   .on("click", d => {
//     var now = Math.floor(new Date().getTime() / 1000);
//     selectTimeframe(now - d.days*86400, now, d.resolution);
//   })
// timeFrameDiv.append("label")
//   .classed("form-check-label", true)
//   .text(d => d.label);


// d3.selectAll(("input[name='chartTypeOptions']")).on("change", function() {
//   chartType = this.value;
//   load();
// });
