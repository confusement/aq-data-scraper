d3.csv("/public/data/densityStats.csv").then(function(data){
    dataRows = []
    for(row of data){
        dataRows.push({
            day:row.day,
            location:"ShaheenBagh",
            value:parseInt(row.ShaheenBagh)
        });
        dataRows.push({
            day:row.day,
            location:"DTC_bus_terminal",
            value:parseInt(row.DTC_bus_terminal)
        });
        dataRows.push({
            day:row.day,
            location:"Nangli_Dairy",
            value:parseInt(row.Nangli_Dairy)
        });
        dataRows.push({
            day:row.day,
            location:"Jharoda_Kalan",
            value:parseInt(row.Jharoda_Kalan)
        });
        dataRows.push({
            day:row.day,
            location:"Sanjay_Colony_2",
            value:parseInt(row.Sanjay_Colony_2)
        });
        dataRows.push({
            day:row.day,
            location:"Tekhand2",
            value:parseInt(row.Tekhand2)
        });
    }

    var myColor = d3.scaleSequential()
        .interpolator( d3.interpolateRdYlBu)
        .domain([d3.max(dataRows, d=>d.value),d3.min(dataRows, d=>d.value)])

    var margin = {top: 40, right: 100, bottom: 30, left: 150},
    width = 2200 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;
  
  // append the svg object to the body of the page
  var svg = d3.select("#Availability")
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    var myGroups = ["1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16","17","18","19","20",
                    "21","22","23","24","25","26","27","28"]
    var myVars = ["ShaheenBagh","DTC_bus_terminal","Nangli_Dairy","Jharoda_Kalan","Sanjay_Colony_2","Tekhand2"]

    var x = d3.scaleBand()
        .range([ 0, width ])
        .domain(myGroups)
        .padding(0.05);

    svg.append("g")
        .style("font-size", 16)
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).tickSize(1))
        .select(".domain").remove()

    var y = d3.scaleBand()
        .range([ height, 0 ])
        .domain(myVars)
        .padding(0.05);
    svg.append("g")
        .style("font-size", 15)
        .attr('transform', 'translate(-20,0)')
        .call(d3.axisLeft(y).tickSize(0))
        .select(".domain").remove()


    var tooltip = d3.select("#Availability")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("position", "fixed")
        .style("border-width", "2px")
        .style("border-radius", "5px")
        .style("padding", "5px")

    var mouseover = function(d) {
        tooltip
        .style("opacity", 1)
        d3.select(this)
        .style("stroke", "black")
        .style("opacity", 1)
    }
    var mousemove = function(d) {
        tooltip
        .html(d.target.__data__.location+ " : " + d.target.__data__.value+"<br>"+"Date : " + d.target.__data__.day + " Oct 2021")
        .style("left", (d.pageX+70) + "px")
        .style("top", (d.pageY) + "px")
    }
    var mouseleave = function(d) {
        tooltip
        .style("opacity", 0)
        d3.select(this)
        .style("stroke", "none")
        .style("opacity", 0.8)
    }    
    svg.selectAll()
        .data(dataRows, function(d) {return d.day+':'+d.location+":"+(d.value).toString();})
        .enter()
        .append("rect")
        .attr("x", function(d) { return x(d.day) })
        .attr("y", function(d) { return y(d.location) })
        .attr("rx", 4)
        .attr("ry", 4)
        .attr("width", x.bandwidth() )
        .attr("height", y.bandwidth() )
        .style("fill", function(d) { return myColor(d.value)} )
        .style("stroke-width", 4)
        .style("stroke", "none")
        .style("opacity", 0.8)
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave)

    svg.selectAll()
        .data(dataRows, function(d) {return d.day+':'+d.location+":"+(d.value).toString();})
        .enter()
        .append("text")
        .style("font-size", 20)
        .style("cursor", "default")
        .style("pointer-events", "none")
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central") 
        .attr("dx", function(d) { return x(d.day)+x.bandwidth()/2 })
        .attr("dy", function(d) { return y(d.location)+y.bandwidth()/2 })
        .attr("width", x.bandwidth() )
        .attr("height", y.bandwidth() )
        .text(function(d) {
            return d.value;
        })

    svg.append("text")
        .attr("x", 0)
        .attr("y", -50)
        .attr("text-anchor", "left")
        .style("font-size", "22px")
        .text("Density of data points per day");

});

db = {}
d3.csv("/public/data/db.csv").then(function(data){
    for(row of data){
        key = row.location + " " + row.date;
        if(db[key]==undefined){
            db[key] = {
                RawData:[]
            }
        }
        db[key].RawData.push(row);
    }
    
    const buckets = [
        new Date("2000-01-01T07:59:00+05:30"),
        new Date("2000-01-01T09:59:00+05:30"),
        new Date("2000-01-01T11:59:00+05:30"),
        new Date("2000-01-01T13:59:00+05:30"),
        new Date("2000-01-01T15:59:00+05:30"),
        new Date("2000-01-01T17:59:00+05:30"),
        new Date("2000-01-01T19:59:00+05:30"),
        new Date("2000-01-01T21:59:00+05:30"),
        new Date("2000-01-01T23:59:00+05:30"),
    ]
    locDB = {}
    for (let locdate in db) {
        let location = locdate.split(" ")[0];
        let date = locdate.split(" ")[1];
        db[locdate].AvgData = []
        for(bucket of buckets){
            copyDate = new Date(bucket)
            copyDate.setDate(date.split("-")[0])
            copyDate.setFullYear(date.split("-")[2])
            copyDate.setMonth(date.split("-")[1])
            db[locdate].AvgData.push({
                pm1_0:0,
                pm2_5:0,
                pm10:0,
                temp:0,
                humid:0,
                timestamp:copyDate,
                location:location,
                count:0
            })
        }
        for(row of db[locdate].RawData){
            copyDate = new Date(row.timestamp)
            copyDate.setDate(1)
            copyDate.setFullYear(2000)
            copyDate.setMonth(0)
            timeStampVal = Date.parse(copyDate)

            bucket_no = 1;
            diffs = []
            for(bucket of buckets){
                diffs.push(Math.abs(timeStampVal -  Date.parse(bucket)));
            } 
            bucket_no = diffs.indexOf(Math.min(...diffs));
            db[locdate].AvgData[bucket_no].pm1_0 = db[locdate].AvgData[bucket_no].pm1_0*1.0 + row.pm1_0*1.0;
            db[locdate].AvgData[bucket_no].pm2_5 = db[locdate].AvgData[bucket_no].pm2_5*1.0 + row.pm2_5*1.0;
            db[locdate].AvgData[bucket_no].pm10 = db[locdate].AvgData[bucket_no].pm10*1.0 + row.pm10*1.0;
            db[locdate].AvgData[bucket_no].humid = db[locdate].AvgData[bucket_no].humid*1.0 + row.humid*1.0;
            db[locdate].AvgData[bucket_no].temp = db[locdate].AvgData[bucket_no].temp*1.0 + row.temp*1.0;
            db[locdate].AvgData[bucket_no].count = db[locdate].AvgData[bucket_no].count*1.0 + 1.0;
        }
        for(row of db[locdate].AvgData){
            row.pm1_0 = row.pm1_0 / (row.count==0?(1):(row.count));
            row.pm2_5 = row.pm2_5 / (row.count==0?(1):(row.count));
            row.pm10 = row.pm10 / (row.count==0?(1):(row.count));
            row.temp = row.temp / (row.count==0?(1):(row.count));
            row.humid = row.humid / (row.count==0?(1):(row.count));
        }
        if(locDB[location]==undefined){
            locDB[location] = {
                RawData:[],
                AvgData:[],
                Date:[]
            }
        }
        locDB[location].RawData.push(db[locdate].RawData)
        locDB[location].AvgData.push(db[locdate].AvgData)
        locDB[location].Date.push(date)
    }
    
    for (let location in locDB) {
        locDB[location].concatenated = [...new Set([].concat(... locDB[location].AvgData))];
        
        locDB[location].dailyTrend = []
        for(bucket of buckets){
            locDB[location].dailyTrend.push({
                pm1_0:0,
                pm2_5:0,
                pm10:0,
                temp:0,
                humid:0,
                timestamp:bucket,
                location:location,
                count:0
            })
        }
        for(dateArray of locDB[location].AvgData){
            bucket_no = 0;
            for(row of dateArray){
                locDB[location].dailyTrend[bucket_no].pm1_0 = locDB[location].dailyTrend[bucket_no].pm1_0*1.0 + row.pm1_0;
                locDB[location].dailyTrend[bucket_no].pm2_5 = locDB[location].dailyTrend[bucket_no].pm2_5*1.0 + row.pm2_5;
                locDB[location].dailyTrend[bucket_no].pm10 = locDB[location].dailyTrend[bucket_no].pm10*1.0 + row.pm10;
                locDB[location].dailyTrend[bucket_no].temp = locDB[location].dailyTrend[bucket_no].temp*1.0 + row.temp;
                locDB[location].dailyTrend[bucket_no].humid = locDB[location].dailyTrend[bucket_no].humid*1.0 + row.humid;
                locDB[location].dailyTrend[bucket_no].count = locDB[location].dailyTrend[bucket_no].count +1;
                bucket_no += 1;
            }
        }
        for(row of locDB[location].dailyTrend){
            row.pm1_0 = row.pm1_0 / (row.count==0?(1):(row.count));
            row.pm2_5 = row.pm2_5 / (row.count==0?(1):(row.count));
            row.pm10 = row.pm10 / (row.count==0?(1):(row.count));
            row.temp = row.temp / (row.count==0?(1):(row.count));
            row.humid = row.humid / (row.count==0?(1):(row.count));
        }
    }

    function plotGraph(idElement,GraphData,allGroup){
        const margin = {top: 10, right: 100, bottom: 50, left: 30},
        width = 1200 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;
        
        // append the svg object to the body of the page
        const svg1 = d3.select(idElement)
        .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
        .append("g")
            .attr("transform",`translate(${margin.left},${margin.top})`);
        
        const dataReady = allGroup.map( function(grpName) { // .map allows to do something for each element of the list
            return {
                name: grpName,
                values: GraphData.map(function(d) {
                return {time: d.timestamp, value: +d[grpName]};
                // .toLocaleTimeString()
                })
            };
        });

        
        var myColor = d3.scaleOrdinal()
            .domain(allGroup)
            .range(d3.schemeSet2);

        var x = d3.scaleTime()
            .domain([new Date(Math.min.apply(null,GraphData.map(a => a.timestamp))), new Date(Math.max.apply(null,GraphData.map(a => a.timestamp)))])
            .range([ 0, width ]);
          svg1.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));

        var y = d3.scaleLinear()
            .domain( [0,400])
            .range([ height, 0 ]);
            svg1.append("g")
            .call(d3.axisLeft(y));
            
        var line = d3.line()
        .x(function(d) { return x(+d.time) })
        .y(function(d) { return y(+d.value) })

        svg1.selectAll("myLines")
        .data(dataReady)
        .enter()
        .append("path")
            .attr("class", function(d){ return d.name })
            .attr("d", function(d){ return line(d.values) } )
            .attr("stroke", function(d){ return myColor(d.name) })
            .style("stroke-width", 4)
            .style("fill", "none")
    
        svg1.selectAll("myDots")
        .data(dataReady)
        .enter()
            .append('g')
            .style("fill", function(d){ return myColor(d.name) })
            .attr("class", function(d){ return d.name })

        .selectAll("myPoints")
        .data(function(d){ return d.values })
        .enter()
        .append("circle")
            .attr("cx", function(d) { return x(d.time) } )
            .attr("cy", function(d) { return y(d.value) } )
            .attr("r", 5)
            .attr("stroke", "white")

        svg1.selectAll("myLabels")
            .data(dataReady)
            .enter()
            .append('g')
            .append("text")
            .attr("class", function(d){ return d.name })
            .datum(function(d) { return {name: d.name, value: d.values[d.values.length - 1]}; }) // keep only the last value of each time series
            .attr("transform", function(d) { return "translate(" + x(d.value.time) + "," + y(d.value.value) + ")"; }) // Put the text at the position of the last point
            .attr("x", 12) // shift the text a bit more right
            .text(function(d) { return d.name; })
            .style("fill", function(d){ return myColor(d.name) })
            .style("font-size", 15)
    
        // Add a legend (interactive)
        svg1
            .selectAll("myLegend")
            .data(dataReady)
            .enter()
            .append('g')
            .append("text")
            .attr('x', function(d,i){ return 30 + i*60})
            .attr('y', 30)
            .text(function(d) { return d.name; })
            .style("fill", function(d){ return myColor(d.name) })
            .style("font-size", 15)
            .style("cursor", "default")
            .on("click", function(d){
                groupName = d.target.innerHTML;
                currentOpacity = d3.selectAll("." + groupName).style("opacity")
                // Change the opacity: from 0 to 1 or from 1 to 0
                d3.selectAll("." + groupName).transition().style("opacity", currentOpacity == 1 ? 0:1)
            })

    }

    function plotGraph2(idElement,GraphData,allGroup){
        const margin = {top: 10, right: 100, bottom: 50, left: 30},
        width = 1200 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;
        
        newGraphData = []

        dateNows = ['10','11','12','13','14','15',
        '16','17','18','19','20','21','22','23']
        for(dates of dateNows){
            newGraphData.push({
                pm1_0:0,
                pm2_5:0,
                pm10:0,
                temp:0,
                humid:0,
                timestamp:new Date(2021, 10, dates, 12, 00, 0, 0),
                location:"g",
                count:0
            })
        }
        for(row of GraphData){
            dateThis = row.timestamp.getDate()
            newGraphData[dateThis-10].pm1_0 = newGraphData[dateThis*1.0-10].pm1_0 *1.0 + row.pm1_0;
            newGraphData[dateThis-10].pm2_5 = newGraphData[dateThis*1.0-10].pm2_5 *1.0 + row.pm2_5;
            newGraphData[dateThis-10].pm10 = newGraphData[dateThis*1.0-10].pm10 *1.0 + row.pm10;
            newGraphData[dateThis-10].temp = newGraphData[dateThis*1.0-10].temp *1.0 + row.temp;
            newGraphData[dateThis-10].humid = newGraphData[dateThis*1.0-10].humid *1.0 + row.humid;
            newGraphData[dateThis-10].count = newGraphData[dateThis*1.0-10].count *1.0 + 1;
        }
        for(row of newGraphData){
            row.pm1_0 = row.pm1_0 / (row.count==0?(1):(row.count));
            row.pm2_5 = row.pm2_5 / (row.count==0?(1):(row.count));
            row.pm10 = row.pm10 / (row.count==0?(1):(row.count));
            row.temp = row.temp / (row.count==0?(1):(row.count));
            row.humid = row.humid / (row.count==0?(1):(row.count));
        }
        // append the svg object to the body of the page
        const svg1 = d3.select(idElement)
        .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
        .append("g")
            .attr("transform",`translate(${margin.left},${margin.top})`);
        
        const dataReady = allGroup.map( function(grpName) { // .map allows to do something for each element of the list
            return {
                name: grpName,
                values: newGraphData.map(function(d) {
                return {time: d.timestamp, value: +d[grpName]};
                // .toLocaleTimeString()
                })
            };
        });

        
        var myColor = d3.scaleOrdinal()
            .domain(allGroup)
            .range(d3.schemeSet1);

        var x = d3.scaleTime()
            .domain([new Date(Math.min.apply(null,newGraphData.map(a => a.timestamp))), new Date(Math.max.apply(null,newGraphData.map(a => a.timestamp)))])
            .range([ 0, width ]);
          svg1.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));

        var y = d3.scaleLinear()
            .domain( [0,400])
            .range([ height, 0 ]);
            svg1.append("g")
            .call(d3.axisLeft(y));
            
        var line = d3.line()
        .x(function(d) { return x(+d.time) })
        .y(function(d) { return y(+d.value) })

        svg1.selectAll("myLines")
        .data(dataReady)
        .enter()
        .append("path")
            .attr("class", function(d){ return d.name })
            .attr("d", function(d){ return line(d.values) } )
            .attr("stroke", function(d){ return myColor(d.name) })
            .style("stroke-width", 4)
            .style("fill", "none")
    
        svg1.selectAll("myDots")
        .data(dataReady)
        .enter()
            .append('g')
            .style("fill", function(d){ return myColor(d.name) })
            .attr("class", function(d){ return d.name })

        .selectAll("myPoints")
        .data(function(d){ return d.values })
        .enter()
        .append("circle")
            .attr("cx", function(d) { return x(d.time) } )
            .attr("cy", function(d) { return y(d.value) } )
            .attr("r", 5)
            .attr("stroke", "white")

        svg1.selectAll("myLabels")
            .data(dataReady)
            .enter()
            .append('g')
            .append("text")
            .attr("class", function(d){ return d.name })
            .datum(function(d) { return {name: d.name, value: d.values[d.values.length - 1]}; }) // keep only the last value of each time series
            .attr("transform", function(d) { return "translate(" + x(d.value.time) + "," + y(d.value.value) + ")"; }) // Put the text at the position of the last point
            .attr("x", 12) // shift the text a bit more right
            .text(function(d) { return d.name; })
            .style("fill", function(d){ return myColor(d.name) })
            .style("font-size", 15)
    
        // Add a legend (interactive)
        units = function(name){
            if(name=="pm1_0"){
                return "PM 1.0 (μg/m3)"
            }
            else if(name=="pm2_5"){
                return "PM 2.5 (μg/m3)"
            }
            else if(name=="pm10"){
                return "PM 10 (μg/m3)"
            }
            else if(name=="temp"){
                return "Temprature (C)"
            }
            else if(name=="Humidity"){
                return "Humidity"
            }
        }
        svg1
            .selectAll("myLegend")
            .data(dataReady)
            .enter()
            .append('g')
            .append("text")
            .attr('x', function(d,i){ return 30 + i*60})
            .attr('y', 30)
            .text(function(d) { return d.name; })
            .style("fill", function(d){ return myColor(d.name) })
            .style("font-size", 15)
            .style("cursor", "default")
            .on("click", function(d){
                groupName = d.target.innerHTML;
                currentOpacity = d3.selectAll("." + groupName).style("opacity")
                // Change the opacity: from 0 to 1 or from 1 to 0
                d3.selectAll("." + groupName).transition().style("opacity", currentOpacity == 1 ? 0:1)
            })

    }

    console.log(locDB)
    plotGraph("#DailyTekhand2",locDB["Tekhand2"].dailyTrend,["pm1_0", "pm2_5", "pm10","temp","humid"])
    // plotGraph("#DailyShaheenBagh",locDB["ShaheenBagh"].dailyTrend,["pm1_0", "pm2_5", "pm10","temp","humid"])
    plotGraph("#DailyDTC_bus_terminal",locDB["DTC_bus_terminal"].dailyTrend,["pm1_0", "pm2_5", "pm10","temp","humid"])
    plotGraph("#DailyNangli_Dairy",locDB["Nangli_Dairy"].dailyTrend,["pm1_0", "pm2_5", "pm10","temp","humid"])
    plotGraph("#DailyJharoda_Kalan",locDB["Jharoda_Kalan"].dailyTrend,["pm1_0", "pm2_5", "pm10","temp","humid"])
    plotGraph("#DailySanjay_Colony_2",locDB["Sanjay_Colony_2"].dailyTrend,["pm1_0", "pm2_5", "pm10","temp","humid"])

    plotGraph2("#ConcatTekhand2",locDB["Tekhand2"].concatenated,["pm1_0", "pm2_5", "pm10","temp","humid"])
    plotGraph2("#ConcatDTC_bus_terminal",locDB["DTC_bus_terminal"].concatenated,["pm1_0", "pm2_5", "pm10","temp","humid"])
    plotGraph2("#ConcatNangli_Dairy",locDB["Nangli_Dairy"].concatenated,["pm1_0", "pm2_5", "pm10","temp","humid"])
    plotGraph2("#ConcatJharoda_Kalan",locDB["Jharoda_Kalan"].concatenated,["pm1_0", "pm2_5", "pm10","temp","humid"])
    plotGraph2("#ConcatSanjay_Colony_2",locDB["Sanjay_Colony_2"].concatenated,["pm1_0", "pm2_5", "pm10","temp","humid"])
    
});

