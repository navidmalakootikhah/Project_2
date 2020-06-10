
// Get all buttons with class="btn" 
var btns = document.getElementsByClassName("btn");

// Loop through the buttons and add the active class to the current/clicked button
for (var i = 0; i < btns.length; i++) {
    btns[i].addEventListener("click", function() {
    var current = document.getElementsByClassName("active");
    current[0].className = current[0].className.replace(" active", "");
    this.className += " active";
    });
}


function updateMap(selectedDate){

    var myMap = L.map("map", {
        center: [40.7128, -74.0060],
        zoom: 11
      });
      
      console.log("I am in updateMap function");
      // Adding tile layer to the map
      L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox/streets-v11",
        accessToken: API_KEY
      }).addTo(myMap);
      
      // Store API query variables
      var url = `http://127.0.0.1:5000/api/v1.0/crime2_data/${selectedDate}`;
      
      console.log(url);

      // Grab the data with d3
      d3.json(url).then((response) => {
      
        console.log(response);

        // Create a new marker cluster group
        var markers = L.markerClusterGroup();
      
        // Loop through data
        for (var i = 0; i < response.length; i++) {
      
            // Add a new marker to the cluster group and bind a pop-up
            markers.addLayer(L.marker([response[i].Latitude, response[i].Longitude])
            .bindPopup("<h5><b>Complaint Type: </b>"+response[i].complaintType+"</h5><h6><b>Descriptor: </b>"+response[i].Descriptor+"</h6><h6><b>City: </b>"+response[i].City+"</h6><h6><b>Address: </b>"+response[i].incidentAddress));
      
        }
      
        // Add our marker cluster layer to the map
        myMap.addLayer(markers);
      
      });
      

}    

//     d3.json(`/api/v1.0/covid_data/${selectedDate}/${selectedBorough}`).then((covidData) => {

//     var covidTable = d3.select("#covidTable");
//     covidTable.html("");

//     console.log(covidData);
//     covidData.forEach(info=> {

//         var row = covidTable.append("tr");
//         Object.entries(info).forEach(([key,value]) => {
//             var row = covidTable.append("tr"); 
//             var cell = row.append("td");
//             if (key !== 'Borough' && key !== 'Date'){
//                 cell.text(`${key}: ${value}`);
//             }
//         });
//     });   
//  })

//  d3.json(`/api/v1.0/crime_data/${selectedDate}/${selectedBorough}`).then((crimeData) => {
//     //console.log(crimeData);
//     //console.log(crimeData);

//     // complaintTypes = [];
//     complaintCount = {};

//     for (var i = 0; i< crimeData.length; i++) {
//         var currentCrime = crimeData[i].complaintType;
        
//         if(currentCrime in complaintCount){

//             complaintCount[currentCrime] += 1;
//         }else {
//             complaintCount[currentCrime] = 1;
//         }
//     }

//     var keys = Object.keys(complaintCount);
//     var values = Object.values(complaintCount);

//     var crimeTable = d3.select("#crimeTable");
//     crimeTable.html("");
//     for (var i=0; i< keys.length; i++) {
//         var row = crimeTable.append("tr");
//         var row = crimeTable.append("tr"); 
//         var cell = row.append("td");
//         cell.text(`${keys[i]}: ${values[i]}`);
//     };   
//     });
// }

let selectedDate = '05/31/2020';
let selectedBorough = 'BRONX';

function init() {
  //find the element in html file which is for date selection 
  var userSelection = d3.select("#selDataset");

  var dateList =[];
  var caseList=[];
  var hospitalizationList=[];
  var deathList = []; 
  var crimeList = [];

  d3.json("/api/v1.0/summary").then((data) => {

    //add the dates from summary table into drop-down box 
    data.forEach(function(d) {
        userSelection.append("option")
        .text(d.Date)
        .property("value", d.Date);

        dateList.push(d.Date);
        caseList.push(d.Cases);
        hospitalizationList.push(d.Hospitalizations);
        deathList.push(d.Deaths);
        crimeList.push(d.ComplaintType);

    });

    var labels = ['Positive Cases', 'Hospitalizations', 'Deaths', 'Crimes'];

    traceLine1 = {
        x: dateList, 
        y: caseList,
        name: "Positive Cases",
        type: "line",
        line: {color: "cyan"}
    }

    traceLine2 = {
        x: dateList, 
        y: hospitalizationList,
        name: "Hospitalizations",
        type: "line",
        line: {color: "red"}
    }

    traceLine3 = {
        x: dateList, 
        y: deathList,
        name: "Deaths",
        type: "line",
        line: {color: "blue"}
    }

    traceLine4 = {
        x: dateList, 
        y: crimeList,
        name: "Crimes",
        type: "line",
        line: {color: "green"}
    }

    //data for the line chart
    var lineData = [traceLine1, traceLine2, traceLine3, traceLine4];

    // layout for line chart
    var layout_line = {
        title: "New York City COVID-19 and crime",
        height: 500,
        width: 800
    };

    Plotly.newPlot("line", lineData, layout_line);

    //Plot positive cases and crimes bar chart
    traceBar1 = {
        x: dateList, 
        y: caseList,
        name: "Positive Cases",
        type: "bar",
    }

    traceBar2 = {
        x: dateList, 
        y: crimeList,
        name: "Crimes",
        type: "bar",
    }

    var barData = [traceBar1, traceBar2];
    // layout for pie chart
    var layout_bar = {
        title: "New York City Positive Cases and Crime",
        height: 500,
        width: 800
    };

    Plotly.newPlot("bar_stacked", barData, layout_bar);

    // set the currently selected date for which graphs are shown
    selectedDate = data[0].Date;
    //console.log(data);

  });

    updateCharts(selectedDate, selectedBorough);
    updateMap(selectedDate);

};

function updateCharts(selectedDate, selectedBorough){

    d3.json(`/api/v1.0/crime_data/${selectedDate}/${selectedBorough}`).then((crimeData) => {
        //console.log(crimeData);
        //console.log(crimeData);

        // complaintTypes = [];
        complaintCount = {};

        for (var i = 0; i< crimeData.length; i++) {
            var currentCrime = crimeData[i].complaintType;
            
            if(currentCrime in complaintCount){
 
                complaintCount[currentCrime] += 1;
            }else {
                complaintCount[currentCrime] = 1;
            }
        }

        traceBar = {
            x: Object.keys(complaintCount), 
            y: Object.values(complaintCount),
            name: "Complaint Types",
            type: "bar",
        }
    
        var barData = [traceBar];
        // layout for pie chart
        var layout_bar = {
            title: `Crimes in ${selectedBorough} at ${selectedDate}`,
            height: 500,
            width: 800
        };
    
        Plotly.newPlot("bar", barData, layout_bar);
        
        var keys = Object.keys(complaintCount);
        var values = Object.values(complaintCount);
    
        var crimeTable = d3.select("#crimeTable");
        crimeTable.html("");
        for (var i=0; i< keys.length; i++) {
            var row = crimeTable.append("tr");
            var row = crimeTable.append("tr"); 
            var cell = row.append("td");
            cell.text(`${keys[i]}: ${values[i]}`);
        }; 

    });
    selectedBorough = selectedBorough.toUpperCase();
    console.log(selectedDate);
    console.log(selectedBorough);


    d3.json(`/api/v1.0/covid_data/${selectedDate}/${selectedBorough}`).then((covidData) => {

        //console.log(covidData)
        var covid = covidData[0];

        var pieValues = [covid.Cases, covid.Hospitalizations, covid.Deaths];

        var labels = ['Positive Cases', 'Hospitalizations', 'Deaths'];

        //create a trace for pie chart
        tracePie = {
            values: pieValues,
            labels: labels,
            type: "pie"
        }

        //data for the pie chart
        var pieData = [tracePie];

        // layout for pie chart
        var layout_pie = {
            title: `${selectedBorough} COVID-19 at ${selectedDate}`,
            height: 600,
            width: 600
        };

      Plotly.newPlot("pie", pieData, layout_pie);

      var covidTable = d3.select("#covidTable");
      covidTable.html("");
  
      console.log(covidData);
      covidData.forEach(info=> {
  
          var row = covidTable.append("tr");
          Object.entries(info).forEach(([key,value]) => {
              var row = covidTable.append("tr"); 
              var cell = row.append("td");
              if (key === 'Cases' || key === 'Hospitalizations' || key === "Deaths"){
                  cell.text(`${key}: ${value}`);
              }
          });
      }); 

    });

    d3.json(`/api/v1.0/covid_crime/${selectedBorough}`).then((covidCrimes) => {

        console.log(covidCrimes);

        var dateList =[];
        var caseList=[];
        var hospitalizationList=[];
        var deathList = []; 
        var crimeList = [];

        covidCrimes.forEach(function(d) {
            dateList.push(d.Date);
            caseList.push(d.Cases);
            hospitalizationList.push(d.Hospitalizations);
            deathList.push(d.Deaths);
            crimeList.push(d.TotalCrimes);
        });
    
        var labels = ['Positive Cases', 'Hospitalizations', 'Deaths', 'Crimes'];
    
        traceLine1 = {
            x: dateList, 
            y: caseList,
            name: "Positive Cases",
            type: "line",
            line: {color: "cyan"}
        }
    
        traceLine2 = {
            x: dateList, 
            y: hospitalizationList,
            name: "Hospitalizations",
            type: "line",
            line: {color: "red"}
        }
    
        traceLine3 = {
            x: dateList, 
            y: deathList,
            name: "Deaths",
            type: "line",
            line: {color: "blue"}
        }
    
        traceLine4 = {
            x: dateList, 
            y: crimeList,
            name: "Crimes",
            type: "line",
            line: {color: "green"}
        }
    
        //data for the line chart
        var lineData = [traceLine1, traceLine2, traceLine3, traceLine4];
    
        // layout for line chart
        var layout_line = {
            title: `${selectedBorough} -Total COVID-19 and Crime Incidents`,
            height: 500,
            width: 1000
        };
    
        Plotly.newPlot("lineChartTotal", lineData, layout_line);

    });  
};


// when user selects an entry from drop-down, this function is called from the html
function optionChanged(optDate) {
    updateCharts(optDate, selectedBorough);
    selectedDate = optDate;
    updateMap(selectedDate);
}


//initialize webpage
init();
