// Define report-related constants

// Report types
export const REPORT_TYPES = [
  { value: "visa_application", label: "Визовая анкета", color: "blue" },
  { value: "work_permit", label: "Разрешение на работу", color: "orange" },
  { value: "travel_history", label: "История поездок", color: "purple" },
  { value: "custom", label: "Пользовательский", color: "green" },
];

// Common field types that may be needed in reports
export const FIELD_TYPES = [
  { value: "text", label: "Текст" },
  { value: "date", label: "Дата" },
  { value: "number", label: "Число" },
  { value: "select", label: "Выбор из списка" },
  { value: "checkbox", label: "Флажок" },
];

// Sample required fields for different report types
export const REQUIRED_FIELDS = {
  visa_application: [
    { name: "travelPurpose", label: "Цель поездки", type: "text" },
    { name: "stayDuration", label: "Длительность пребывания", type: "text" },
    { name: "visitedCountries", label: "Ранее посещенные страны", type: "text" },
  ],
  work_permit: [
    { name: "employerName", label: "Наименование работодателя", type: "text" },
    { name: "position", label: "Должность", type: "text" },
    { name: "salary", label: "Заработная плата", type: "number" },
  ],
  travel_history: [
    { name: "startDate", label: "Дата начала периода", type: "date" },
    { name: "endDate", label: "Дата окончания периода", type: "date" },
  ],
  custom: [],
};
