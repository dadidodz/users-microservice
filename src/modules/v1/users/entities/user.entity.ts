import {
  Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    OneToMany,
    PrimaryColumn,
} from 'typeorm';
import { v7 as uuidv7 } from 'uuid';

@Entity('users')
export class User {
    
    @PrimaryColumn('varchar', { length: 36 }) 
    id: string = uuidv7();

    @Column({ length: 255, nullable: true })
    firstName: string;

    @Column({ length: 255, nullable: true })
    lastName: string;

    @Column({ length: 255, unique: true })
    username: string;

    @Column({ length: 255, unique: true })
    email: string;

    @Column({ length: 255 })
    password: string;

    @Column({ nullable: false })
    birthDate: Date;

    @Column({ unique: true })
    phoneNumber: string;

    @CreateDateColumn()
    createdAt: Date;

    @Column({ type: 'varchar', nullable: true })
    currentHashedRefreshToken: string | null;

}