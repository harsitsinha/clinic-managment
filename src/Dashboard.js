import React, { useState, useEffect } from 'react';
import * as d3 from 'd3';
import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';
import './Dashboard.css';

const Dashboard = () => {
  const [patients, setPatients] = useState([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [dailyRevenue, setDailyRevenue] = useState(0);
  const [yearlyRevenue, setYearlyRevenue] = useState(0);
  const [selectedOption, setSelectedOption] = useState('Month');

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'patients'));
      const patientsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      patientsList.sort((a, b) => new Date(a.date) - new Date(b.date));
      console.log("Fetched patients data: ", patientsList); // Debugging line
      setPatients(patientsList);
      calculateRevenue(patientsList);
    } catch (error) {
      console.error("Error fetching patients: ", error);
    }
  };

  const calculateRevenue = (patientsList) => {
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = new Date().toISOString().slice(0, 7);
    const currentYear = new Date().getFullYear();

    const dailyRevenue = patientsList
      .filter(p => p.date === today)
      .reduce((acc, cur) => acc + Number(cur.amount), 0);

    const monthlyRevenue = patientsList
      .filter(p => p.date.startsWith(currentMonth))
      .reduce((acc, cur) => acc + Number(cur.amount), 0);

    const yearlyRevenue = patientsList
      .filter(p => new Date(p.date).getFullYear() === currentYear)
      .reduce((acc, cur) => acc + Number(cur.amount), 0);

    setDailyRevenue(dailyRevenue);
    setMonthlyRevenue(monthlyRevenue);
    setYearlyRevenue(yearlyRevenue);
  };

  useEffect(() => {
    if (patients.length > 0) {
      console.log("Patients data for charting: ", patients); // Debugging line
      drawCharts();
    }
  }, [patients, selectedOption]);

  const drawCharts = () => {
    d3.selectAll("svg").remove();
    drawMonthlyRevenueChart();
    drawGenderDistributionPie();
    drawPaymentModePie();
    drawTopReferredBy();
    drawTopAddresses();
    drawAgeDistributionHistogram();
    drawPatientsChart();
  };

  const drawMonthlyRevenueChart = () => {
    const data = d3.rollup(
      patients,
      v => d3.sum(v, d => d.amount),
      d => d3.timeMonth(new Date(d.date))
    );

    const sortedData = Array.from(data).sort((a, b) => a[0] - b[0]);

    const width = 800;
    const height = 400;
    const svg = d3.select('#monthlyRevenueChart').append('svg')
      .attr('width', '100%')
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    const x = d3.scaleTime()
      .domain(d3.extent(sortedData, d => d[0]))
      .range([50, width - 50]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(sortedData, d => d[1])])
      .range([height - 50, 50]);

    const line = d3.line()
      .x(d => x(d[0]))
      .y(d => y(d[1]));

    svg.append('path')
      .datum(sortedData)
      .attr('fill', 'none')
      .attr('stroke', 'purple')
      .attr('stroke-width', 2)
      .attr('d', line);

    svg.append('g')
      .attr('transform', `translate(0,${height - 50})`)
      .call(d3.axisBottom(x).ticks(d3.timeMonth.every(1)));

    svg.append('g')
      .attr('transform', 'translate(50,0)')
      .call(d3.axisLeft(y));

    svg.append('text')
      .attr('x', (width / 2))
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .text('Monthly Revenue / Number of Patients');
  };

  const drawGenderDistributionPie = () => {
    const data = d3.rollup(
      patients,
      v => v.length,
      d => d.gender
    );

    const width = 400;
    const height = 400;
    const radius = Math.min(width, height) / 2 - 15;
    const color = d3.scaleOrdinal()
      .domain(data.keys())
      .range(["#007bff", "#ff69b4", "#ff0000"]);

    const svg = d3.select('#genderPieChart').append('svg')
      .attr('width', '100%')
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    const pie = d3.pie().value(d => d[1]);
    const arc = d3.arc().innerRadius(0).outerRadius(radius);

    svg.selectAll('path')
      .data(pie([...data]))
      .enter().append('path')
      .attr('d', arc)
      .attr('fill', d => color(d.data[0]))
      .on('mouseover', function (event, d) {
        d3.select(this).transition().duration(200).attr('d', d3.arc().innerRadius(0).outerRadius(radius + 5));
        svg.append('text')
          .attr('class', 'hover-text')
          .attr('text-anchor', 'middle')
          .attr('dy', '.35em')
          .text(d.data[1]);
      })
      .on('mouseout', function (event, d) {
        d3.select(this).transition().duration(200).attr('d', arc);
        svg.selectAll('.hover-text').remove();
      });

    const legend = svg.append('g')
      .attr('transform', `translate(${width / 2 - 60},${-height / 2 + 10})`);

    legend.selectAll('rect')
      .data(color.domain())
      .enter().append('rect')
      .attr('x', 0)
      .attr('y', (d, i) => i * 20)
      .attr('width', 18)
      .attr('height', 18)
      .style('fill', color);

    legend.selectAll('text')
      .data(color.domain())
      .enter().append('text')
      .attr('x', 24)
      .attr('y', (d, i) => i * 20 + 9)
      .attr('dy', '.35em')
      .text(d => d);
  };

  const drawPaymentModePie = () => {
    const data = d3.rollup(
      patients,
      v => v.length,
      d => d.paymentMode
    );

    const width = 400;
    const height = 400;
    const radius = Math.min(width, height) / 2 - 15;
    const color = d3.scaleOrdinal()
      .domain(data.keys())
      .range(d3.schemeCategory10);

    const svg = d3.select('#paymentModePieChart').append('svg')
      .attr('width', '100%')
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    const pie = d3.pie().value(d => d[1]);
    const arc = d3.arc().innerRadius(0).outerRadius(radius);

    svg.selectAll('path')
      .data(pie([...data]))
      .enter().append('path')
      .attr('d', arc)
      .attr('fill', d => color(d.data[0]))
      .on('mouseover', function (event, d) {
        d3.select(this).transition().duration(200).attr('d', d3.arc().innerRadius(0).outerRadius(radius + 10));
        svg.append('text')
          .attr('class', 'hover-text')
          .attr('text-anchor', 'middle')
          .attr('dy', '.35em')
          .text(d.data[1]);
      })
      .on('mouseout', function (event, d) {
        d3.select(this).transition().duration(200).attr('d', arc);
        svg.selectAll('.hover-text').remove();
      });

    const legend = svg.append('g')
      .attr('transform', `translate(${width / 2 - 60},${-height / 2 + 10})`);

    legend.selectAll('rect')
      .data(color.domain())
      .enter().append('rect')
      .attr('x', 0)
      .attr('y', (d, i) => i * 20)
      .attr('width', 18)
      .attr('height', 18)
      .style('fill', color);

    legend.selectAll('text')
      .data(color.domain())
      .enter().append('text')
      .attr('x', 24)
      .attr('y', (d, i) => i * 20 + 9)
      .attr('dy', '.35em')
      .text(d => d);
  };

  const drawTopReferredBy = () => {
    const data = d3.rollup(
      patients,
      v => v.length,
      d => d.referredBy
    );
    const sortedData = [...data].sort((a, b) => b[1] - a[1]).slice(0, 3);

    const width = 400;
    const height = 400;
    const svg = d3.select('#topReferredByChart').append('svg')
      .attr('width', '100%')
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    const x = d3.scaleBand()
      .domain(sortedData.map(d => d[0]))
      .range([50, width - 50])
      .padding(0.1);

    const y = d3.scaleLinear()
      .domain([0, d3.max(sortedData, d => d[1])])
      .range([height - 50, 50]);

    svg.selectAll('.bar')
      .data(sortedData)
      .enter().append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d[0]))
      .attr('y', d => y(d[1]))
      .attr('width', x.bandwidth())
      .attr('height', d => height - 50 - y(d[1]))
      .attr('fill', 'green');

    svg.append('g')
      .attr('transform', `translate(0,${height - 50})`)
      .call(d3.axisBottom(x));

    svg.append('g')
      .attr('transform', 'translate(50,0)')
      .call(d3.axisLeft(y));
  };

  const drawTopAddresses = () => {
    const data = d3.rollup(
      patients,
      v => v.length,
      d => d.address
    );
    const sortedData = [...data].sort((a, b) => b[1] - a[1]).slice(0, 5);

    const width = 400;
    const height = 400;
    const svg = d3.select('#topAddressesChart').append('svg')
      .attr('width', '100%')
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    const x = d3.scaleBand()
      .domain(sortedData.map(d => d[0]))
      .range([50, width - 50])
      .padding(0.1);

    const y = d3.scaleLinear()
      .domain([0, d3.max(sortedData, d => d[1])])
      .range([height - 50, 50]);

    svg.selectAll('.bar')
      .data(sortedData)
      .enter().append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d[0]))
      .attr('y', d => y(d[1]))
      .attr('width', x.bandwidth())
      .attr('height', d => height - 50 - y(d[1]))
      .attr('fill', 'blue');

    svg.append('g')
      .attr('transform', `translate(0,${height - 50})`)
      .call(d3.axisBottom(x));

    svg.append('g')
      .attr('transform', 'translate(50,0)')
      .call(d3.axisLeft(y));
  };

  const drawAgeDistributionHistogram = () => {
    const data = patients.map(d => d.age).filter(age => age !== undefined && age !== null && !isNaN(age));
    if (data.length === 0) {
        console.log("No valid age data to plot.");
        return;
    }
    const width = 800;
    const height = 400;
    const svg = d3.select('#ageDistributionHistogram').append('svg')
        .attr('width', '100%')
        .attr('height', height)
        .attr('viewBox', `0 0 ${width} ${height}`)
        .attr('preserveAspectRatio', 'xMidYMid meet');

    const x = d3.scaleLinear()
        .domain([0, d3.max(data)])
        .range([50, width - 50]);

    const histogram = d3.histogram()
        .domain(x.domain())
        .thresholds(x.ticks(20));

    const bins = histogram(data);

    const y = d3.scaleLinear()
        .domain([0, d3.max(bins, d => d.length)])
        .range([height - 50, 50]);

    svg.selectAll('.bar')
        .data(bins)
        .enter().append('rect')
        .attr('class', 'bar')
        .attr('x', d => x(d.x0))
        .attr('y', d => y(d.length))
        .attr('width', d => x(d.x1) - x(d.x0) - 1)
        .attr('height', d => height - 50 - y(d.length))
        .attr('fill', 'orange');

    svg.append('g')
        .attr('transform', `translate(0,${height - 50})`)
        .call(d3.axisBottom(x));

    svg.append('g')
        .attr('transform', 'translate(50,0)')
        .call(d3.axisLeft(y));

    svg.append('text')
        .attr('x', (width / 2))
        .attr('y', 20)
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .style('font-weight', 'bold')
        .text('Age Distribution');
  };

  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value);
  };

  const drawPatientsChart = () => {
    if (selectedOption === 'Month') {
      drawPatientsPerMonthChart();
    } else {
      drawPatientsPerDayChart();
    }
  };

  const drawPatientsPerMonthChart = () => {
    const data = d3.rollup(
      patients,
      v => v.length,
      d => d3.timeMonth(new Date(d.date))
    );

    const sortedData = Array.from(data).sort((a, b) => a[0] - b[0]);

    const width = 800;
    const height = 400;
    const svg = d3.select('#patientsPerMonthChart').append('svg')
      .attr('width', '100%')
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    const x = d3.scaleBand()
      .domain(sortedData.map(d => d[0]))
      .range([50, width - 50])
      .padding(0.1);

    const y = d3.scaleLinear()
      .domain([0, d3.max(sortedData, d => d[1])])
      .range([height - 50, 50]);

    svg.selectAll('.bar')
      .data(sortedData)
      .enter().append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d[0]))
      .attr('y', d => y(d[1]))
      .attr('width', x.bandwidth())
      .attr('height', d => height - 50 - y(d[1]))
      .attr('fill', 'blue');

    svg.append('g')
      .attr('transform', `translate(0,${height - 50})`)
      .call(d3.axisBottom(x).ticks(d3.timeMonth.every(1)).tickFormat(d3.timeFormat('%B')));

    svg.append('g')
      .attr('transform', 'translate(50,0)')
      .call(d3.axisLeft(y));

    svg.append('text')
      .attr('x', (width / 2))
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .text('Number of Patients per Month');
  };

  const drawPatientsPerDayChart = () => {
    const startOfWeek = d3.timeMonday(new Date());
    const endOfWeek = d3.timeSunday.ceil(new Date());

    const data = d3.rollup(
      patients,
      v => v.length,
      d => d3.timeDay(new Date(d.date))
    );

    const filteredData = Array.from(data)
      .filter(d => d[0] >= startOfWeek && d[0] <= endOfWeek)
      .sort((a, b) => a[0] - b[0]);

    const width = 800;
    const height = 400;
    const svg = d3.select('#patientsPerDayChart').append('svg')
      .attr('width', '100%')
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    const x = d3.scaleBand()
      .domain(filteredData.map(d => d[0]))
      .range([50, width - 50])
      .padding(0.1);

    const y = d3.scaleLinear()
      .domain([0, d3.max(filteredData, d => d[1])])
      .range([height - 50, 50]);

    svg.selectAll('.bar')
      .data(filteredData)
      .enter().append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d[0]))
      .attr('y', d => y(d[1]))
      .attr('width', x.bandwidth())
      .attr('height', d => height - 50 - y(d[1]))
      .attr('fill', 'blue');

    svg.append('g')
      .attr('transform', `translate(0,${height - 50})`)
      .call(d3.axisBottom(x).ticks(d3.timeDay.every(1)).tickFormat(d3.timeFormat('%A')));

    svg.append('g')
      .attr('transform', 'translate(50,0)')
      .call(d3.axisLeft(y));

    svg.append('text')
      .attr('x', (width / 2))
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .text('Number of Patients per Day');
  };
  return (
    <div className="dashboard">
      <nav className="navbar">
        <h1>Analytics Dashboard</h1>
      </nav>
      <div className="grid-container">
        <div className="grid-item item1">
          <h2>Monthly Revenue / Number of Patients</h2>
          <div id="monthlyRevenueChart"></div>
        </div>
        <div className="grid-item item2">
          <h2>Revenue</h2>
          <div className="revenue-stats">
            <p><strong>Daily Revenue:</strong> ₹{dailyRevenue}</p>
            <p><strong>Monthly Revenue:</strong> ₹{monthlyRevenue}</p>
            <p><strong>Yearly Revenue:</strong> ₹{yearlyRevenue}</p>
          </div>
        </div>
        <div className="grid-item item3">
          <h2>Gender Distribution</h2>
          <div id="genderPieChart"></div>
        </div>
        <div className="grid-item item4">
          <h2>Payment Mode Distribution</h2>
          <div id="paymentModePieChart"></div>
        </div>
        <div className="grid-item item5">
          <h2>Top 3 Referred By</h2>
          <div id="topReferredByChart"></div>
        </div>
        <div className="grid-item item6">
          <h2>Top 5 Addresses</h2>
          <div id="topAddressesChart"></div>
        </div>
        <div className="grid-item item7">
          <h2>Age Distribution</h2>
          <div id="ageDistributionHistogram"></div>
        </div>
        <div className="grid-item item8">
          <h2>Patients Chart</h2>
          <div>
            <select onChange={handleOptionChange}>
              <option value="Month">Month</option>
              <option value="Week">Week</option>
            </select>
          </div>
          <div id="patientsPerMonthChart" style={{ display: selectedOption === 'Month' ? 'block' : 'none' }}></div>
          <div id="patientsPerDayChart" style={{ display: selectedOption === 'Week' ? 'block' : 'none' }}></div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
