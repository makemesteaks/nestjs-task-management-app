import { Exclude } from 'class-transformer';
import { Users } from '../auth/users.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { TaskStatus } from './task-status.enum';

@Entity()
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  status: TaskStatus;

  // not used arrow function, how we access the user from the task entity, object with property eager == false
  @ManyToOne((_type) => Users, (user) => user.tasks, { eager: false })
  // whenever object is printed into plain text, user is hidden
  // it's used so the user property doesn't get shown in the http response object when you call the getTasks endpoints
  @Exclude({ toPlainOnly: true })
  user: Users;
}
