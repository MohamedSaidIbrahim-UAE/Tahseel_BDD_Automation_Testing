export interface UserRegistrationData {
  username: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
}

export interface UserLoginData {
  username: string;
  password: string;
}
