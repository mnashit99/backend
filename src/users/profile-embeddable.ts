import { Column } from 'typeorm';

export type Gender = 'male' | 'female' | 'other';

export class Profile {
  @Column({ name: 'profile_full_name', nullable: true, length: 150 })
  fullName?: string;

  @Column({ name: 'profile_birthday', type: 'date', nullable: true })
  birthday?: Date;

  @Column({ name: 'profile_gender', type: 'varchar', nullable: true, length: 20 })
  gender?: Gender;
}
