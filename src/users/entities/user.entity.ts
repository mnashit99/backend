import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

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
  role: string; 

@Column({ type: 'varchar', nullable: true })
resetToken: string | null;

@Column({ type: 'timestamptz', nullable: true })
resetTokenExpiry: Date | null;

}
