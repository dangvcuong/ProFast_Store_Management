import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../screes/csss/DatePicker.css';

const DatePickerComponent = ({ onDateChange }) => {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  const handleStartDateChange = (date) => {
    // Nếu ngày bắt đầu sau ngày kết thúc, điều chỉnh lại ngày kết thúc
    if (date > endDate) {
      setEndDate(date); // Điều chỉnh ngày kết thúc bằng ngày bắt đầu
    }
    setStartDate(date);
    onDateChange({ startDate: date, endDate }); // Callback gửi dữ liệu lên cha
  };

  const handleEndDateChange = (date) => {
    // Nếu ngày kết thúc trước ngày bắt đầu, điều chỉnh lại ngày bắt đầu
    if (date < startDate) {
      setStartDate(date); // Điều chỉnh ngày bắt đầu bằng ngày kết thúc
    }
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
