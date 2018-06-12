import React, { Component } from 'react';
import moment from 'moment';
import './App.css';
import cloud1 from './assets/cloud1.png';
import cloud2 from './assets/cloud2.png';

import { capitalize } from './helpers';

class App extends Component {
  static defaultProps = {
    // should be in .env
    appId: '2f0f42a23a6f2ca2022fc754f2185bde',
    countryCode: 'usa',
    tempUnit: 'imperial'
  };

  constructor(props, context) {
    super(props);

    this.state = {
      searchCity: '',
      currentWeather: null,
      weatherOutlook: null
    };

    this.fetchWeather = this.fetchWeather.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.clearSearch = this.clearSearch.bind(this);
  }

  fetchWeather(e) {
    e.preventDefault()

    const { searchCity } = this.state;
    const { countryCode, appId, tempUnit } = this.props;

    if (!searchCity) {
      alert('Please enter a search city.');
      return;
    }

    const currentWeatherUrl = `http://api.openweathermap.org/data/2.5/weather?q=${searchCity},${countryCode}&APPID=${appId}&units=${tempUnit}`;
    const weatherOutlookUrl = `http://api.openweathermap.org/data/2.5/forecast?q=${searchCity},${countryCode}&APPID=${appId}&units=${tempUnit}`;

    const currentWeatherRequest = fetch(currentWeatherUrl).then((res) => res.json());
    const weatherOutlookRequest = fetch(weatherOutlookUrl).then((res) => res.json());

    Promise.all([currentWeatherRequest, weatherOutlookRequest])
    .then((results) => {
        const { weather, main: { humidity, temp } } = results[0];
        const { description } = weather[0];
        const nextCurrentWeather = { humidity, temp, description };

        let nextWeatherOutlook = [];

        const { list } = results[1]
        let currentDay = null;
        for (let forcast of list) {
          const { main: { temp }, dt_txt, weather } = forcast;
          // Note: because we don't know what time zone the city is in and all times given by api are in UTC we can't ensure icons will be day time
          if (currentDay !== dt_txt.split(' ')[0]) {
            currentDay = dt_txt.split(' ')[0];
            nextWeatherOutlook.push({
              icon: weather[0].icon,
              date: dt_txt,
              high: temp,
              low: temp
            });
          } else if (nextWeatherOutlook[nextWeatherOutlook.length - 1].high < temp) {
              nextWeatherOutlook[nextWeatherOutlook.length - 1].high = temp;
          } else if (nextWeatherOutlook[nextWeatherOutlook.length - 1].low > temp) {
              nextWeatherOutlook[nextWeatherOutlook.length - 1].low = temp;
          }
        }

        nextWeatherOutlook = nextWeatherOutlook.slice(0, 5)

        this.setState({
          currentWeather: nextCurrentWeather,
          weatherOutlook: nextWeatherOutlook
        });
    })
    .catch((err) => {
      console.log(err);
      alert('Oopsie daisy! We weren\'t able to find weather for that city.');
    })
  }

  handleChange(e) {
    this.setState({ searchCity: e.target.value});
  }

  clearSearch(e) {
    this.setState({
      searchCity: '',
      weatherOutlook: null
    })
  }

  renderCurrentWeather() {
    const {temp, description, humidity} = this.state.currentWeather;
    return (
      <div className='currentWeather'>
        <div className='currentTemp'>
            {Math.round(temp)}&deg;
        </div>
        <div className='currentConditions'>
          <div className='farenheit'>F</div>
          <div className='description'>{capitalize(description)}</div>
          <div className='humidity'>{humidity}% Humidity</div>
        </div>
      </div>
    )
  }

  renderFiveDayWeather() {
    const { weatherOutlook } = this.state
    return (
      <div className='fiveDayContainer'>
        {weatherOutlook.map((day, i) => {
          const { date, icon, low, high } = day;
          return (
            <div className='upcomingWeather' key={i}>
              {moment(date).format('MMM Do')}
              <img src={`http://openweathermap.org/img/w/${icon}.png`} alt='weather_icon'/>
              <div className='maxTemp'>{Math.round(high)}</div>
              <div className='minTemp'>{Math.round(low)}</div>
            </div>
          )
        })}
      </div>
    );
  }

  render() {
    const { weatherOutlook, searchCity } = this.state;

    return (
      <div className="app">
        <img src={cloud1} alt='cloud' className='cloud1'/>
        <img src={cloud2} alt='cloud' className='cloud2'/>
        <div className='modalContainer'>
          <form onSubmit={this.fetchWeather}>
            <div className='inputWrapper'>
                <i className="fas fa-search" onClick={(e) => this.fetchWeather(e)}></i>
                <input
                  autoFocus
                  className='input'
                  placeholder='Please enter a US city'
                  value={capitalize(searchCity)}
                  onChange={this.handleChange}
                />
                <i className="fas fa-times" onClick={this.clearSearch}></i>
            </div>
        </form>
        {weatherOutlook ? this.renderCurrentWeather() : null}
        {weatherOutlook ? this.renderFiveDayWeather() : null}
        </div>
      </div>
    );
  }
}

export default App;
