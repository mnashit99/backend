import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Profile } from '../profile-embeddable';
import { Address } from 'src/addresses/entities/address.entity';

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
  phone: string;

  @Column()
  role: string; 

@Column({ type: 'varchar', nullable: true })
resetToken: string | null;

@Column({ type: 'timestamptz', nullable: true })
resetTokenExpiry: Date | null;

@Column(() => Profile)
  profile?: Profile;

  @OneToMany(() => Address, (address) => address.user, { cascade: true })
addresses: Address[];

}
