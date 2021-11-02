async function getData(){
    densityStats = await d3.csv("/public/data/densityStats.csv");

    sensorRawData = await d3.csv("/public/data/db.csv");

    sensorData = {}
    for(row of sensorRawData){
        key = row.location
        if(sensorData[key]==undefined){
            sensorData[key] = []
        }
        sensorData[key].push(row);
    }

    okhlaData = await d3.csv("/public/data/okhla.csv");
    najafgarhData = await d3.csv("/public/data/najafgarh.csv");

    for(row of okhlaData){
        let [dat,tim]= row["To Date"].split(" ");
        let [date,month,year] = dat.split("-");
        let UTCdate = year+"-"+month+"-"+date;
        let UTCTime = tim+":00+05:30";
        row["timestamp"] = UTCdate+"T"+UTCTime;
    }
    for(row of najafgarhData){
        let [dat,tim]= row["To Date"].split(" ");
        let [date,month,year] = dat.split("-");
        let UTCdate = year+"-"+month+"-"+date;
        let UTCTime = tim+":00+05:30";
        row["timestamp"] = UTCdate+"T"+UTCTime;
    }
    cpcbData = {
        najafgarh_cpcb : najafgarhData,
        okhla_cpcb: okhlaData
    }
    return [densityStats,sensorData,cpcbData]
}
async function plotDensity(densityStats,elementID){
    dataRows = []
    for(row of densityStats){
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
    height = 500 - margin.top - margin.bottom;
  
    // append the svg object to the body of the page
    var svg = d3.select(elementID)
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
        .call(d3.axisBottom(x).tickSize(0))
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
        .style("left", (d.screenX+30) + "px")
        .style("top", (d.screenY-30) + "px")
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

}
async function hourlyClusterFunc(timestamp,params){
    dateObj = new Date(timestamp);
    // console.log(params);
    dateObj.setMilliseconds(0);
    dateObj.setMinutes(0);
    dateObj.setSeconds(0);
    let hour = dateObj.getHours();
    hour = hour - (hour%params.factor);
    dateObj.setHours(hour);
    return dateObj;
}
async function clusterData(clusterFunc,dataFrame,clusterColumns,params){
    console.log("Clustering . . . . ")
    debugStop = 5;
    let outputDataFrame = {}
    console.log(dataFrame)
    for(row of dataFrame){
        let nearestCenter = await clusterFunc(row["timestamp"],params);
        let key = nearestCenter.toLocaleString();
        if(outputDataFrame[key]==undefined){
            outputDataFrame[key] = {}
            outputDataFrame[key]["timestamp"] = nearestCenter;
            outputDataFrame[key]["count"] = 0.0;
            for(col of clusterColumns){
                outputDataFrame[key][col] = 0;
            }
        }
        // if(debugStop>0){
        //     console.log(outputDataFrame[key]);
        //     debugStop-=1;
        // }
        outputDataFrame[key]["count"] = outputDataFrame[key]["count"]*1.0 + 1*1.0;
        for(col of clusterColumns){
            if(!isNaN(parseFloat(row[col]))){
                outputDataFrame[key][col] = parseFloat(outputDataFrame[key][col])*1.0 + parseFloat(row[col]);
            }

        }
    }
    for (var key of Object.keys(outputDataFrame)) {
        for(col of clusterColumns){
            outputDataFrame[key][col] = outputDataFrame[key][col] / (outputDataFrame[key]["count"]==0?(1):(outputDataFrame[key]["count"]));
        }
    }
    return Object.values(outputDataFrame)
}
function download(content, fileName, contentType) {
    var a = document.createElement("a");
    var file = new Blob([content], {type: contentType});
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
}
async function clusteredData(sensorData,cpcbData,fact){
    locations = Object.keys(sensorData);
    hourlyData = {}
    clusterColumns = ["pm1_0","pm2_5","pm10","temp","humid"]
    for(loc of locations){
        hourlyData[loc] = await clusterData(hourlyClusterFunc,sensorData[loc],clusterColumns,{factor:fact});
    }
    clusterColumns2 = ["pm2_5","pm10"]
    hourlyData["najafgarh_cpcb"] = await clusterData(hourlyClusterFunc,cpcbData["najafgarh_cpcb"],clusterColumns2,{factor:fact});
    hourlyData["okhla_cpcb"] = await clusterData(hourlyClusterFunc,cpcbData["okhla_cpcb"],clusterColumns2,{factor:fact});

    // download(JSON.stringify(hourlyData), 'json.txt', 'text/plain');
    return hourlyData;
}
function plotGraph(elementID,series,groupList,zoomLevel){
    const margin = {top: 10, right: 100, bottom: 50, left: 30},
    width = (1200.0*zoomLevel) - margin.left - margin.right,
    height = 800 - margin.top - margin.bottom;
    
    // append the svg object to the body of the page
    d3.select(elementID).html("");

    const svg1 = d3.select(elementID)
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform",`translate(${margin.left},${margin.top})`);
    
    const dataReady = groupList.map( function(grpName) { // .map allows to do something for each element of the list
        return {
            name: grpName,
            values: series.map(function(d) {
            return {time: d.timestamp, value: (isNaN(parseFloat(d[grpName]))?(0):(d[grpName]))};
            })
        };
    });

    // console.log(JSON.stringify(dataReady))
    var myColor = d3.scaleOrdinal()
            .domain(groupList)
            .range(d3.schemeSet2);

    var x = d3.scaleTime()
        .domain([new Date(Math.min.apply(null,series.map(a => a.timestamp))), new Date(Math.max.apply(null,series.map(a => a.timestamp)))])
        .range([ 0, width ]);
        svg1.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).ticks(15*zoomLevel))

    allVals = []
    for (var key of Object.keys(dataReady)) {
        // console.log(dataReady[key])
        allVals.push(...(dataReady[key].values.map(elem => elem.value)))
    }
    mx = Math.min(1000,Math.max.apply(null,allVals));
    mn = Math.min.apply(null,allVals)

    var y = d3.scaleLinear()
        .domain( [mn,mx+20])
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

    var tooltip = d3.select(elementID)
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip1")
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
    .html(d.path[1].__data__.name + " : " + parseFloat(d.target.__data__.value).toFixed(2)+ "<br>" +d.target.__data__.time.toLocaleString())
    .style("left", (d.screenX+30) + "px")
    .style("top", (d.screenY-30) + "px")
    }
    var mouseleave = function(d) {
    tooltip
    .style("opacity", 0)
    d3.select(this)
    .style("stroke", "none")
    .style("opacity", 0.8)
    }   

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
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave)

    svg1.selectAll("myLabels")
        .data(dataReady)
        .enter()
        .append('g')
        .append("text")
        .attr("class", function(d){ return d.name })
        .datum(function(d) { 
            lastIndex = d.values.length - 1;
            while(true){
                if(d.values[lastIndex].value==undefined)
                {
                    lastIndex -= 1;
                }
                else{
                    break;
                }
            }
            return {
            name: d.name, 
            value: d.values[lastIndex]
            }; 
        }) // keep only the last value of each time series
        .attr("transform", function(d) { return "translate(" + x(d.value.time) + "," + y(d.value.value) + ")"; }) // Put the text at the position of the last point
        .attr("x", 12) // shift the text a bit more right
        .text(function(d) { return d.name; })
        .style("fill", function(d){ return myColor(d.name) })
        .style("font-size", 14)
        .style("width", "auto")

    // Add a legend (interactive)
    svg1
        .selectAll("myLegend")
        .data(dataReady)
        .enter()
        .append('g')
        .append("text")
        .attr('x', function(d,i){ return 30 + i*190})
        .attr('y', 30)
        .text(function(d) { return d.name; })
        .style("fill", function(d){ return myColor(d.name) })
        .style("font-size", 20)
        .style("cursor", "default")
        .on("click", function(d){
            groupName = d.target.innerHTML;
            currentOpacity = d3.selectAll("." + groupName).style("opacity")
            // Change the opacity: from 0 to 1 or from 1 to 0
            d3.selectAll("." + groupName).transition().style("opacity", currentOpacity == 1 ? 0:1)
        })
}
function updateStats(weeklyDataFrame,colNamesIn,tableID1,tableID2){
    tableElem1 = document.getElementById(tableID1);
    tableElem2 = document.getElementById(tableID2);
    allStats = []
    for(df of weeklyDataFrame){
        weekStats = {}
        for(colName of colNamesIn){
            // console.log(df)
            dataSeries = df.map(row => row[colName]);
            stats = [
                d3.min(dataSeries),
                d3.max(dataSeries),
                d3.mean(dataSeries),
                d3.median(dataSeries),
                d3.variance(dataSeries)
            ]
            weekStats[colName]=stats;
        }
        allStats.push(weekStats)
    }
    for(colName of colNamesIn){
        let row1 = document.createElement("tr");

        let header1 = document.createElement("td");
        header1.innerText = colName;
        row1.appendChild(header1)

        for(let it=0;it<5;it++){
            let stat = document.createElement("td");
            stat.innerText = parseFloat(allStats[0][colName][it]).toFixed(2);
            row1.appendChild(stat)
        }

        let separator1 = document.createElement("td");
        separator1.classList.add("separator");
        row1.appendChild(separator1);

        for(let it=0;it<5;it++){
            let stat = document.createElement("td");
            stat.innerText = parseFloat(allStats[1][colName][it]).toFixed(2);
            row1.appendChild(stat)
        }

        let row2 = document.createElement("tr");

        let header2 = document.createElement("td");
        header2.innerText = colName;
        row2.appendChild(header2)

        for(let it=0;it<5;it++){
            let stat = document.createElement("td");
            stat.innerText = parseFloat(allStats[2][colName][it]).toFixed(2);
            row2.appendChild(stat)
        }
        
        let separator2 = document.createElement("td");
        separator2.classList.add("separator");
        row2.appendChild(separator2);

        for(let it=0;it<5;it++){
            let stat = document.createElement("td");
            stat.innerText = parseFloat(allStats[3][colName][it]).toFixed(2);
            row2.appendChild(stat)
        }

        tableElem1.appendChild(row1)
        tableElem2.appendChild(row2)
    }
}
async function main(){
    console.log("Inside Main");
    [densityStats,sensorData,cpcbData] = await getData();

    hourlyData = await clusteredData(sensorData,cpcbData,4);


    // hourlyData = await d3.json("/public/data/factor2cluster.json");    
    await plotDensity(densityStats,"#Availability");

    locations = (Object.keys(sensorData)).concat(Object.keys(cpcbData));

//===================================================================================
    // CPCB vs others group wise PM2.5
    g1aData  = {}
    tsSet = new Set();
    for(loc of locations){
        for(row of hourlyData[loc]){
            tsSet.add(row["timestamp"].getTime())
        }
    }
    uniqueStamps = Array.from(tsSet)

    for(tim of uniqueStamps){
        newRow = {};
        newRow.timestamp = new Date(tim);

        newRow.diff_najafgarh = undefined;
        newRow.diff_okhla = undefined;
        
        newRow.local_okhla = undefined;
        newRow.local_najafgarh = undefined;
        
        for(loc of locations){
            newRow[loc] = undefined;
        }
        g1aData[tim]=newRow;
    }

    for(loc of locations){
        for(row of hourlyData[loc]){
            g1aData[row.timestamp.getTime()][loc] = row["pm2_5"];
        }
    }
    g1aData = Object.values(g1aData)

    for(row of g1aData){
        let o1 = row["ShaheenBagh"]!=undefined;
        let o2 = row["Tekhand2"]!=undefined;
        let o3 = row["Sanjay_Colony_2"]!=undefined;

        let ob = row["okhla_cpcb"]!=undefined

        let n1 = row["DTC_bus_terminal"]!=undefined;
        let n2 = row["Jharoda_Kalan"]!=undefined;
        let n3 = row["Nangli_Dairy"]!=undefined;

        let nb = row["najafgarh_cpcb"]!=undefined

        if((o1 || o2 || o3) && ob){
            let sum = (!o1?(0):(row["ShaheenBagh"]))*1.0 + (!o2?(0):(row["Tekhand2"]))*1.0 + (!o3?(0):(row["Sanjay_Colony_2"]))*1.0;
            let count = (!o1?(0):(1))*1.0 + (!o2?(0):(1))*1.0 + (!o3?(0):(1))*1.0;
            row["diff_okhla"] = (sum/(count)) - row["okhla_cpcb"];
            row["local_okhla"] = (sum/(count))
            row["diff_okhla"] = isNaN(parseFloat(row["diff_okhla"])) ? (undefined) : (row["diff_okhla"])
            row["local_okhla"] = isNaN(parseFloat(row["local_okhla"])) ? (undefined) : (row["local_okhla"])
        }

        if((n1 || n2 || n3) && nb){
            let sum = (!n1?(0):(row["DTC_bus_terminal"])) + (!n2?(0):(row["Jharoda_Kalan"])) + (!n3?(0):(row["Nangli_Dairy"]));
            let count = (!n1?(0):(1)) + (!n2?(0):(1)) + (!n3?(0):(1));
            row["diff_najafgarh"] = (sum/(count)) - row["najafgarh_cpcb"];
            row["local_najafgarh"] = (sum/(count))
            row["diff_najafgarh"] = isNaN(parseFloat(row["diff_najafgarh"])) ? (undefined) : (row["diff_najafgarh"])
            row["local_najafgarh"] = isNaN(parseFloat(row["local_najafgarh"])) ? (undefined) : (row["local_najafgarh"])
        }
    }

    g1aData.sort(function(a,b){
        // Turn your strings into dates, and then subtract them
        // to get a value that is either negative, positive, or zero.
        return new Date(a.timestamp) - new Date(b.timestamp);
    });

    plotGraph("#g1a",g1aData,Object.keys(sensorData),1.0);
    
    $("#g1a_slider").on("input change", function(){ 
        plotGraph("#g1a",g1aData,Object.keys(sensorData),$(this).val());
    });

//===================================================================================

//===================================================================================

    plotGraph("#g2a",g1aData,["local_okhla","local_najafgarh","diff_okhla","diff_najafgarh","najafgarh_cpcb","okhla_cpcb"],1.0);

    $("#g2a_slider").on("input change", function(){ 
        plotGraph("#g2a",g1aData,["local_okhla","local_najafgarh","diff_okhla","diff_najafgarh","najafgarh_cpcb","okhla_cpcb"],$(this).val());
    });

//===================================================================================

//===================================================================================

    thres1 = -1;thres2 = -1;thres3 = -1;
    for(let it=0;it<g1aData.length;it++){
        timestamp = g1aData[it].timestamp;
        if(timestamp.getDate()==8){
            if(thres1==-1)
                thres1=it;
        }
        if(timestamp.getDate()==15){
            if(thres2==-1)
                thres2=it;
        }
        if(timestamp.getDate()==22){
            if(thres3==-1)
                thres3=it;
        }
    }
    week1 = g1aData.slice(0,thres1)
    week2 = g1aData.slice(thres1,thres2)
    week3 = g1aData.slice(thres2,thres3)
    week4 = g1aData.slice(thres3,g1aData.length)

    colNamesIn = Object.keys(g1aData[0]).slice(1,g1aData.length)
    updateStats([week1,week2,week3,week4],colNamesIn,"table1","table2")

//===================================================================================

//===================================================================================

    // CPCB vs others group wise PM2.5
    g1bData  = {}

    for(tim of uniqueStamps){
        newRow = {};
        newRow.timestamp = new Date(tim);

        newRow.diff_najafgarh = undefined;
        newRow.diff_okhla = undefined;
        
        newRow.local_okhla = undefined;
        newRow.local_najafgarh = undefined;
        
        for(loc of locations){
            newRow[loc] = undefined;
        }
        g1bData[tim]=newRow;
    }

    for(loc of locations){
        for(row of hourlyData[loc]){
            g1bData[row.timestamp.getTime()][loc] = row["pm10"];
        }
    }
    g1bData = Object.values(g1bData)

    for(row of g1bData){
        let o1 = row["ShaheenBagh"]!=undefined;
        let o2 = row["Tekhand2"]!=undefined;
        let o3 = row["Sanjay_Colony_2"]!=undefined;

        let ob = row["okhla_cpcb"]!=undefined

        let n1 = row["DTC_bus_terminal"]!=undefined;
        let n2 = row["Jharoda_Kalan"]!=undefined;
        let n3 = row["Nangli_Dairy"]!=undefined;

        let nb = row["najafgarh_cpcb"]!=undefined

        if((o1 || o2 || o3) && ob){
            let sum = (!o1?(0):(row["ShaheenBagh"]))*1.0 + (!o2?(0):(row["Tekhand2"]))*1.0 + (!o3?(0):(row["Sanjay_Colony_2"]))*1.0;
            let count = (!o1?(0):(1))*1.0 + (!o2?(0):(1))*1.0 + (!o3?(0):(1))*1.0;
            row["diff_okhla"] = (sum/(count)) - row["okhla_cpcb"];
            row["local_okhla"] = sum;
            row["diff_okhla"] = isNaN(parseFloat(row["diff_okhla"])) ? (undefined) : (row["diff_okhla"])
            row["local_okhla"] = isNaN(parseFloat(row["local_okhla"])) ? (undefined) : (row["local_okhla"])
        }

        if((n1 || n2 || n3) && nb){
            let sum = (!n1?(0):(row["DTC_bus_terminal"])) + (!n2?(0):(row["Jharoda_Kalan"])) + (!n3?(0):(row["Nangli_Dairy"]));
            let count = (!n1?(0):(1)) + (!n2?(0):(1)) + (!n3?(0):(1));
            row["diff_najafgarh"] = (sum/(count)) - row["najafgarh_cpcb"];
            row["local_najafgarh"] = sum;
            row["diff_najafgarh"] = isNaN(parseFloat(row["diff_najafgarh"])) ? (undefined) : (row["diff_najafgarh"])
            row["local_najafgarh"] = isNaN(parseFloat(row["local_najafgarh"])) ? (undefined) : (row["local_najafgarh"])
        }
    }

    g1bData.sort(function(a,b){
        // Turn your strings into dates, and then subtract them
        // to get a value that is either negative, positive, or zero.
        return new Date(a.timestamp) - new Date(b.timestamp);
    });

    plotGraph("#g1b",g1bData,Object.keys(sensorData),1.0);
    
    $("#g1b_slider").on("input change", function(){ 
        plotGraph("#g1b",g1bData,Object.keys(sensorData),$(this).val());
    });

//===================================================================================

    week1 = g1bData.slice(0,thres1)
    week2 = g1bData.slice(thres1,thres2)
    week3 = g1bData.slice(thres2,thres3)
    week4 = g1bData.slice(thres3,g1bData.length)
    colNamesIn = Object.keys(g1bData[0]).slice(1,g1bData.length)
    updateStats([week1,week2,week3,week4],colNamesIn,"table3","table4")

//===================================================================================

    plotGraph("#g2b",g1bData,["local_okhla","local_najafgarh","diff_okhla","diff_najafgarh","najafgarh_cpcb","okhla_cpcb"],1.0);

    $("#g2b_slider").on("input change", function(){ 
        plotGraph("#g2b",g1bData,["local_okhla","local_najafgarh","diff_okhla","diff_najafgarh","najafgarh_cpcb","okhla_cpcb"],$(this).val());
    });

//===================================================================================

//===================================================================================

    g1cData  = {}

    for(tim of uniqueStamps){
        newRow = {};
        newRow.timestamp = new Date(tim);        
        for(loc of locations){
            newRow[loc] = undefined;
        }
        g1cData[tim]=newRow;
    }

    for(loc of locations){
        for(row of hourlyData[loc]){
            g1cData[row.timestamp.getTime()][loc] = row["pm1_0"];
        }
    }
    g1cData = Object.values(g1cData)
    g1cData.sort(function(a,b){
        // Turn your strings into dates, and then subtract them
        // to get a value that is either negative, positive, or zero.
        return new Date(a.timestamp) - new Date(b.timestamp);
    });

    plotGraph("#g1c",g1cData,Object.keys(sensorData),1.0);
    
    $("#g1c_slider").on("input change", function(){ 
        plotGraph("#g1c",g1cData,Object.keys(sensorData),$(this).val());
    });

//===================================================================================

//===================================================================================

    g1dData  = {}

    for(tim of uniqueStamps){
        newRow = {};
        newRow.timestamp = new Date(tim);        
        for(loc of locations){
            newRow[loc] = undefined;
        }
        g1dData[tim]=newRow;
    }

    for(loc of locations){
        for(row of hourlyData[loc]){
            g1dData[row.timestamp.getTime()][loc] = row["temp"];
        }
    }
    g1dData = Object.values(g1dData)
    g1dData.sort(function(a,b){
        // Turn your strings into dates, and then subtract them
        // to get a value that is either negative, positive, or zero.
        return new Date(a.timestamp) - new Date(b.timestamp);
    });

    plotGraph("#g1d",g1dData,Object.keys(sensorData),1.0);

    $("#g1d_slider").on("input change", function(){ 
        plotGraph("#g1d",g1dData,Object.keys(sensorData),$(this).val());
    });

//===================================================================================

//===================================================================================
    g1eData  = {}

    for(tim of uniqueStamps){
        newRow = {};
        newRow.timestamp = new Date(tim);        
        for(loc of locations){
            newRow[loc] = undefined;
        }
        g1eData[tim]=newRow;
    }

    for(loc of locations){
        for(row of hourlyData[loc]){
            g1eData[row.timestamp.getTime()][loc] = row["humid"];
        }
    }
    g1eData = Object.values(g1eData)
    g1eData.sort(function(a,b){
        // Turn your strings into dates, and then subtract them
        // to get a value that is either negative, positive, or zero.
        return new Date(a.timestamp) - new Date(b.timestamp);
    });

    plotGraph("#g1e",g1eData,Object.keys(sensorData),1.0);

    $("#g1e_slider").on("input change", function(){ 
        plotGraph("#g1e",g1eData,Object.keys(sensorData),$(this).val());
    });
//===================================================================================

}

$(document).ready(function(){
    $('.tabs').tabs();
    main();
});     
