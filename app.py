import os
from flask import Flask, render_template, jsonify
from sqlalchemy import create_engine
import numpy as np
import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, func
from config import password
from flask_cors import CORS


#Key Things, added a few line to jupyter lab
#in SQL everyone has to run the following to add primary key
#ALTER TABLE covid ADD PRIMARY KEY (index);
#ALTER TABLE crime ADD PRIMARY KEY (index);

################Navid added for Mapping
config = {
  'ORIGINS': [
    'http://localhost:5000',  # React
    'http://127.0.0.1:5000',  # React
  ],

  'SECRET_KEY': '...'
}

app = Flask(__name__)


##############Navid Added for Mapping
CORS(app, resources={ r'/*': {'origins': config['ORIGINS']}}, supports_credentials=True)

# setup Postgres connection
engine = create_engine(f'postgresql://postgres:{password}@localhost:5432/NYC_COVID19_CRIMES_DB')

# reflect an existing database into a new model
Base = automap_base()
# reflect the tables
Base.prepare(engine, reflect=True)

# Save reference to the table
crime = Base.classes.crime
covid = Base.classes.covid
summary = Base.classes.summary


# Create the main page
@app.route("/")
def welcome():
    # return (
    #     f"Available Routes:<br/>"
    #     f"/api/v1.0/crime_data<br/>"
    #     f"/api/v1.0/covid_data"
    # )
    return render_template("index.html")

# Create the Covid Jasonify Page
@app.route("/api/v1.0/covid_data/<path:date>/<borough>")
def covidfunc(date,borough):
    session = Session(engine)
    results = session.query(covid.Date,covid.Cases,covid.Hospitalizations,covid.Deaths,covid.Borough, covid.Latitude, covid.Longitude, covid.TotalCrimes).filter(covid.Date == date).filter(covid.Borough == borough).all()

    session.close()
    
    
    all_covid = []
    for Date, Cases, Hospitalizations, Deaths, Borough, Latitude, Longitude, TotalCrimes in results:
        covid_dict = {}
        covid_dict["Date"] = Date
        covid_dict["Cases"] = Cases
        covid_dict["Hospitalizations"] = Hospitalizations
        covid_dict["Deaths"] = Deaths
        covid_dict["Borough"] = Borough
        covid_dict["Latitude"] = Latitude
        covid_dict["Longitude"] = Longitude
        covid_dict["TotalCrimes"] = TotalCrimes
        all_covid.append(covid_dict)
    
    print(all_covid)

    return jsonify(all_covid)

# Create the Covid-Crimes Jasonify Page
@app.route("/api/v1.0/covid_crime/<borough>")
def covidcrimefunc(borough):
    session = Session(engine)
    results = session.query(covid.Date,covid.Cases,covid.Hospitalizations,covid.Deaths,covid.Borough, covid.Latitude, covid.Longitude, covid.TotalCrimes).filter(covid.Borough == borough).all()

    session.close()
    
    
    all_covid_crime = []
    for Date, Cases, Hospitalizations, Deaths, Borough, Latitude, Longitude, TotalCrimes in results:
        covidcrime_dict = {}
        covidcrime_dict["Date"] = Date
        covidcrime_dict["Cases"] = Cases
        covidcrime_dict["Hospitalizations"] = Hospitalizations
        covidcrime_dict["Deaths"] = Deaths
        covidcrime_dict["Borough"] = Borough
        covidcrime_dict["Latitude"] = Latitude
        covidcrime_dict["Longitude"] = Longitude
        covidcrime_dict["TotalCrimes"] = TotalCrimes
        all_covid_crime.append(covidcrime_dict)
    
    # print(covidcrime_dict)

    return jsonify(all_covid_crime)

@app.route("/api/v1.0/crime2_data/<path:date>")

def crimedatefunc(date):
    
    session = Session(engine)
    results = session.query(crime.Date,crime.Borough,crime.Latitude,crime.Longitude, crime.ComplaintType, crime.Descriptor, crime.locationType, crime.City, crime.incidentAddress).filter(crime.Date == date).all()

    session.close()
    
    crime_map = []
    for Date, Borough, Latitude, Longitude, ComplaintType , Descriptor,  locationType, City,incidentAddress in results:
        crime_dict = {}
        crime_dict["Date"] = Date
        crime_dict["Borough"] = Borough
        crime_dict["Latitude"] = Latitude
        crime_dict["Longitude"] = Longitude
        crime_dict["complaintType"] = ComplaintType
        crime_dict["Descriptor"] = Descriptor
        crime_dict["locationType"] = locationType
        crime_dict["City"] = City
        crime_dict["incidentAddress"] = incidentAddress
        crime_map.append(crime_dict)

    return jsonify(crime_map)

# Create the Summary Jasonify Page
@app.route("/api/v1.0/summary/")
def summaryfunc():
    session = Session(engine)
    results = session.query(summary.Date,summary.TotalCases,summary.TotalHospitalizations,summary.TotalDeaths,summary.ComplaintType).all()

    session.close()
    
    
    all_summary = []
    for Date, TotalCases, TotalHospitalizations, TotalDeaths, ComplaintType in results:
        summary_dict = {}
        summary_dict["Date"] = Date
        summary_dict["Cases"] = TotalCases
        summary_dict["Hospitalizations"] = TotalHospitalizations
        summary_dict["Deaths"] = TotalDeaths
        summary_dict["ComplaintType"] = ComplaintType
        all_summary.append(summary_dict)
    
  
    return jsonify(all_summary)


# Create the Crime Jasonify Page
@app.route("/api/v1.0/crime_data/<path:date>/<borough>")

def crimefunc(date,borough):
    
    session = Session(engine)
    results = session.query(crime.Date,crime.Borough,crime.Latitude,crime.Longitude, crime.ComplaintType, crime.Descriptor, crime.locationType, crime.City, crime.incidentAddress).filter(crime.Date == date).filter(crime.Borough == borough).all()

    # test = session.query(crime.ComplaintType).filter_by(crime.ComplaintType).count()

    session.close()
    
    all_crime = []
    for Date, Borough, Latitude, Longitude, ComplaintType , Descriptor,  locationType, City,incidentAddress in results:
        crime_dict = {}
        crime_dict["Date"] = Date
        crime_dict["Borough"] = Borough
        crime_dict["Latitude"] = Latitude
        crime_dict["Longitude"] = Longitude
        crime_dict["complaintType"] = ComplaintType
        crime_dict["Descriptor"] = Descriptor
        crime_dict["locationType"] = locationType
        crime_dict["City"] = City
        crime_dict["incidentAddress"] = incidentAddress
        all_crime.append(crime_dict)

    return jsonify(all_crime)
   
if __name__ == "__main__":
    app.run(debug=True)
