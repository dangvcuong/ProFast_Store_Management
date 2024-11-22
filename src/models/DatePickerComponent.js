import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../screes/csss/DatePicker.css';

const DatePickerComponent = ({ onDateChange }) => {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  const handleStartDateChange = (date) => {
    setStartDate(date);
    onDateChange({ startDate: date, endDate }); // Callback gửi dữ liệu lên cha
  };

  const handleEndDateChange = (date) => {
    setEndDate(date);
    onDateChange({ startDate, endDate: date });
  };

  return (
    <div className="date-picker-container">
      <div className="date-picker">
        <label>Từ ngày</label>
        <DatePicker
          selected={startDate}
          onChange={handleStartDateChange}
          dateFormat="dd/MM/yyyy"
          maxDate={new Date()}
          className="date-input"
        />
      </div>
      <div className="date-picker">
        <label>Đến ngày</label>
        <DatePicker
          selected={endDate}
          onChange={handleEndDateChange}
          dateFormat="dd/MM/yyyy"
          maxDate={new Date()}
          className="date-input"
        />
      </div>
    </div>
  );
};

export default DatePickerComponent;
