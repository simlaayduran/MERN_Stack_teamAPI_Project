import { UserTypes } from "../enums/UserTypes";

export interface User {
  firstName: string;
  lastName: string;
  email: string;
  userType: UserTypes[];
  username: string;
  studentID: number | null;
  verified: boolean;
}

export const emptyUser: User = {
  firstName: "", lastName: "", email: "", userType: [],
  username: "",
  studentID: 0,
  verified: false
};
