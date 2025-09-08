import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { Profile } from '../profile-embeddable';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column()
  password: string;

  @Column()
  phone: number;

  @Column()
  role: string; 

@Column({ type: 'varchar', nullable: true })
resetToken: string | null;

@Column({ type: 'timestamptz', nullable: true })
resetTokenExpiry: Date | null;

@Column(() => Profile)
  profile?: Profile;

}
