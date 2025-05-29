import dayjs from 'dayjs';
import 'dayjs/locale/ru';

// Set Russian locale for date formatting
dayjs.locale('ru');

// Format date to readable format
export const formatDate = (date: string | Date | undefined): string => {
  if (!date) return 'Не указано';
  return dayjs(date).format('DD.MM.YYYY HH:mm');
};

// Format date to date only
export const formatDateOnly = (date: string | Date | undefined): string => {
  if (!date) return 'Не указано';
  return dayjs(date).format('DD.MM.YYYY');
};

// Format date to time only
export const formatTimeOnly = (date: string | Date | undefined): string => {
  if (!date) return 'Не указано';
  return dayjs(date).format('HH:mm');
};

// Format file size
export const formatFileSize = (bytes: number | undefined): string => {
  if (!bytes) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Format currency
export const formatCurrency = (amount: number | undefined): string => {
  if (amount === undefined) return 'Не указано';
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 2,
  }).format(amount);
};

// Format phone number
export const formatPhoneNumber = (phone: string | undefined): string => {
  if (!phone) return 'Не указано';
  
  // Remove non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format Russian phone number
  if (cleaned.length === 11) {
    return `+${cleaned[0]} (${cleaned.substring(1, 4)}) ${cleaned.substring(4, 7)}-${cleaned.substring(7, 9)}-${cleaned.substring(9, 11)}`;
  }
  
  return phone;
};
