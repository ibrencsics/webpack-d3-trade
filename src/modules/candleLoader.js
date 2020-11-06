import * as d3 from 'd3';
import * as fc from 'd3fc';

// https://blog.scottlogic.com/2018/09/21/d3-financial-chart.html
// https://colineberhardt.github.io/yahoo-finance-d3fc/

export default class CandleLoader {

    constructor(svgElem) {
        this.svg = d3.select(svgElem);
        this.data = [];
    }

    loadAndRender(params) {
        //var startDate = new Date(2020, 9, 23, 0, 0, 0);
        //var stopDate = new Date(2020, 9, 23, 23, 59, 59);
        console.log("Requested: " + new Date(params.start * 1000) + " - " + new Date(params.stop * 1000));

        var uri = 
            "https://finnhub.io/api/v1/" + params.symbolType +
            "/candle?symbol=" + params.symbol + 
            "&resolution=" + params.resolution +
            //"&from=" + startDate.getTime()/1000 + //+ 1603465200
            //"&to=" + stopDate.getTime()/1000 + //+ 1603468800
            "&from=" + params.start + 
            "&to=" + params.stop +
            "&token=bua8bcf48v6q418ga8d0";
        
        d3.json(uri)
            .then(json => this.renderInner(json, params.chartType))
            .catch(error => console.log(error))
        ;
    }

    renderInner(json, chartType) {
        this.svg.selectAll("*").remove();
        //console.log(json);
        this.transform(json);
        
        if (chartType == "area") {
            this.renderArea();
        } else {
            this.renderCandle();
        }
    }

    transform(json) {
        this.data = [];
        var latest = json.t[0];
        for (var i = 0, l = json.c.length; i < l; i++) {
            this.data[i] = { 
                date: new Date(json.t[i] * 1000), 
                open: json.o[i], 
                close: json.c[i], 
                low: json.l[i], 
                high: json.h[i], 
                volume: json.v[i] 
            }; 
            if (json.t[i] > latest) latest = json.t[i];
        }

        //console.log(json.c.length);
        //console.log("Received: " + this.data[0].date + " - " + this.data[json.c.length-1].date);
        //console.log(new Date(latest * 1000));
    }

    renderCandle() {
        const yExtent = fc.extentLinear().pad([0.1, 0.1]).accessors([d => d.high, d => d.low]);
        const xExtent = fc.extentDate().accessors([d => d.date]);

        const gridlines = fc.annotationSvgGridline();
        const candlestick = fc.seriesSvgCandlestick();
        
        const multi = fc.seriesSvgMulti().series([gridlines, candlestick]);
        
        const chart = fc
            .chartCartesian(d3.scaleTime(), d3.scaleLinear())
            .yDomain(yExtent(this.data))
            .xDomain(xExtent(this.data))
            .svgPlotArea(multi);

        this.svg
            .datum(this.data)
            .call(chart);
    }

    renderArea() {
        const yExtent = fc.extentLinear()
            // .pad([0.1, 0.1])
            // .include([0])
            .accessors([d => d.high, d => d.low]);
        const xExtent = fc.extentDate()
            .accessors([d => d.date]);       

        const gridlines = fc.annotationSvgGridline();
      
        const lineSeries = fc
            .seriesSvgLine()
            .mainValue(d => d.high)
            .crossValue(d => d.date);

        const areaSeries = fc
            .seriesSvgArea()
            .baseValue(d => yExtent(this.data)[0])
            .mainValue(d => d.high)
            .crossValue(d => d.date);
            
        // moving average

        const ma = fc
            .indicatorMovingAverage()
            .value(d => d.high)
            .period(15);

        const maData = ma(this.data);

        this.data = this.data.map((d, i) => ({ ma: maData[i], ...d }));

        const movingAverageSeries = fc
            .seriesSvgLine()
            .mainValue(d => d.ma)
            .crossValue(d => d.date)
            .decorate(sel =>
                sel.enter()
                .classed("ema", true)
            );

        // volume series

        const volumeExtent = fc
            .extentLinear()
            .include([0])
            .pad([0, 2])
            .accessors([d => d.volume]);
        const volumeDomain = volumeExtent(this.data);

        const volumeToPriceScale = d3
            .scaleLinear()
            .domain(volumeDomain)
            .range(yExtent(this.data));

        const volumeSeries = fc
            .seriesSvgBar()
            .bandwidth(2)
            .crossValue(d => d.date)
            .mainValue(d => volumeToPriceScale(d.volume))
            .decorate(sel =>
              sel
                .enter()
                .classed("volume", true)
                .attr("fill", d => (d.open > d.close ? "red" : "green"))
            );

        
        // all

        const multi = fc.seriesSvgMulti()
            .series([
                gridlines, 
                areaSeries, lineSeries, 
                movingAverageSeries, volumeSeries,
            ])
            ;
        
        const chart = fc
            .chartCartesian(d3.scaleTime(), d3.scaleLinear())
            .yDomain(yExtent(this.data))
            .xDomain(xExtent(this.data))
            .svgPlotArea(multi)
            ;
       
        this.svg
            .datum(this.data)
            .call(chart);
    } 
}

// const line = fc
//     .seriesSvgArea()
//     .crossValue(d => d.date)
//     .mainValue(d => d.close);

// const multi = fc.seriesSvgMulti().series([gridlines, line]);
