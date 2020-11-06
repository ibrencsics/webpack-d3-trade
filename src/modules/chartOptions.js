import * as d3 from 'd3';
import datepicker from 'js-datepicker'

export default class ChartOptions {
    
    constructor(divElem, selectTimeframe, selectChartType, startingDay) {
        this.div = d3.select(divElem);
        this.selectTimeframe = selectTimeframe;
        this.selectChartType = selectChartType;
        this.startingDay = startingDay;

        this.renderTimeFrames();
        this.renderChartTypes();
        this.renderDataPicker();
    }

    renderTimeFrames() {
        const timeFrames = [
            {"label": "1d", "days": 1, "resolution": "5"}, 
            {"label": "1w", "days": 7, "resolution": "30"},
            {"label": "1m", "days": 30, "resolution": "60"},
            {"label": "1y", "days": 365, "resolution": "D"},
            {"label": "5y", "days": 5*365, "resolution": "W"},
            {"label": "20y", "days": 20*365, "resolution": "M"},
            {"label": "50y", "days": 50*365, "resolution": "M"}
        ];
        
        var timeFrameDiv = 
            this.div.select("#chartOptionsTimeFrames")
            .selectAll("div")
            .data(timeFrames)
            .enter()
            .append("div")
            .classed("form-check", true)
            .classed("form-check-inline", true);

        timeFrameDiv.append("input")
            .attr("type", "radio")
            .property("checked", (d, i) => i == 0)
            .attr("name", "timeFrameOptions")
            .classed("form-check-input", true)
            .on("click", d => {
                var now = Math.floor(new Date().getTime() / 1000);
                this.selectTimeframe(now - d.days*86400, now, d.resolution);
            })

        timeFrameDiv.append("label")
            .classed("form-check-label", true)
            .text(d => d.label);
    }

    renderChartTypes() {
        this.div.selectAll(("input[name='chartTypeOptions']")).on("change", () => 
            this.selectChartType(d3.select("input[name='chartTypeOptions']:checked").node().value));          
    }

    renderDataPicker() {
        const picker = datepicker('#chartTypeDatePicker', { // TODO: select under the divElem
            // Event callbacks.
            onSelect: instance => {
              // Show which date was selected.
              //console.log(instance);
              //console.log(instance.dateSelected);
              var midnight = instance.dateSelected.getTime() / 1000;
              this.selectTimeframe(midnight, midnight + 86400, 5);
              // start = midnight;
              // stop = midnight + 86400;
              // candleLoader.loadAndRender({"stock": stockSelected, "start": start, "stop": stop, "resolution": 5});  
            },
            onShow: instance => {
              console.log('Calendar showing.')
            },
            onHide: instance => {
              console.log('Calendar hidden.')
            },
            onMonthChange: instance => {
              // Show the month of the selected date.
              console.log(instance.currentMonthName)
            },
           
            // Customizations.
            formatter: (input, date, instance) => {
              // This will display the date as `1/1/2019`.
              input.value = date.toDateString()
            },
            // position: 'tr', // Top right.
            startDay: 1, // Calendar week starts on a Monday.
            customDays: ['S', 'M', 'T', 'W', 'Th', 'F', 'S'],
            customMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            customOverlayMonths: ['😀', '😂', '😎', '😍', '🤩', '😜', '😬', '😳', '🤪', '🤓 ', '😝', '😮'],
            overlayButton: 'Go!',
            overlayPlaceholder: 'Enter a 4-digit year',
           
            // Settings.
            alwaysShow: true, // Never hide the calendar.
            dateSelected: this.startingDay, // Today is selected.
            maxDate: new Date(2099, 0, 1), // Jan 1st, 2099.
            minDate: new Date(2016, 5, 1), // June 1st, 2016.
            startDate: this.startingDay, // This month.
            showAllDates: true, // Numbers for leading & trailing days outside the current month will show.
           
            // Disabling things.
            // noWeekends: true, // Saturday's and Sunday's will be unselectable.
            //disabler: date => (date.getDay() === 2 && date.getMonth() === 9), // Disabled every Tuesday in October
            disabledDates: [new Date(2050, 0, 1), new Date(2050, 0, 3)], // Specific disabled dates.
            disableMobile: true, // Conditionally disabled on mobile devices.
            disableYearOverlay: true, // Clicking the year or month will *not* bring up the year overlay.
           
            // ID - be sure to provide a 2nd picker with the same id to create a daterange pair.
            id: 1
          })
          
    }
}

// d3.select("#timeFrames")
//   .selectAll("button")
//   .data(timeFrames)
//   .enter()
//   .append("button")
//   .text(d => d.label)
//   .on("click", d => {
//     var now = Math.floor(new Date().getTime() / 1000);
//     selectTimeframe(now - d.days*86400, now, d.resolution);
//   })
//   ;

// d3.selectAll(("input[name='chartType']")).on("change", function(){
//   chartType = this.value;
//   load();
// });
