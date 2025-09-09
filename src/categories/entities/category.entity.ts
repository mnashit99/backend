import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';

@Entity()
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @ManyToOne(() => Category, (category) => category.children, { nullable: true })
  parent?: Category; // for sub-categories

  @OneToMany(() => Category, (category) => category.parent)
  children: Category[];
}
