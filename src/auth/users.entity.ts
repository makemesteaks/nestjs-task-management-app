import { Task } from '../tasks/task.entity';
import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

@Entity()
export class Users {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  // not used arrow function, how we access the user from the task entity, object with property eager == true
  // eager == true fetches the tasks automatically
  @OneToMany((_type) => Task, (task) => task.user, { eager: true })
  tasks: Task[];
}
