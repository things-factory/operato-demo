import { MigrationInterface, QueryRunner, getRepository } from 'typeorm'

import { Domain } from '@things-factory/shell'
import { Role } from '@things-factory/auth-base'

const SEED_ROLE = ['ACCOUNTING', 'POS', 'MMS', 'ERP', 'LMD', 'FREIGHT', 'FLEET']

export class roles1597668561695 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    const roleRepository = getRepository(Role)
    const [domains] = await getRepository(Domain).findAndCount()
    return Promise.all(
      domains.map(async domain => {
        Promise.all(
          SEED_ROLE.map(async seed => {
            await roleRepository.save({ name: seed })
          })
        )
      })
    )
  }

  public async down(queryRunner: QueryRunner): Promise<any> {}
}
