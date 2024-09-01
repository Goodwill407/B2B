import { Role } from './role';

export class User {
  id!: string;
  img!: string;
  username!: string;
  password!: string;
  firstName!: string;
  lastName!: string;
  role!: Role;
  token!: string;
  cluster!: string;
  name!: string;
  asssignedTo!: string;
}
