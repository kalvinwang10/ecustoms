export interface FormData {
  fullPassportName: string;
  nationality: string;
  flightNumber: string;
  arrivalDate: string;
  portOfArrival: string;
}

export const initialFormData: FormData = {
  fullPassportName: '',
  nationality: '',
  flightNumber: '',
  arrivalDate: '',
  portOfArrival: '',
};