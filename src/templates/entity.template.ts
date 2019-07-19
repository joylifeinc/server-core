 import { PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, VersionColumn, Column, Generated, Index } from 'typeorm';

export abstract class Template  {

  @PrimaryGeneratedColumn('increment')
  public key: number;

  @Index({ unique: true })
  @Column('uuid')
  @Generated('uuid')
  public id: string;

  @CreateDateColumn()
  public createAt: Date;

  @UpdateDateColumn()
  public updateAt: Date;

  @VersionColumn({ default: 1 })
  public version: number;

  @Column('bool', { default: false})
  public deleted: boolean;
}