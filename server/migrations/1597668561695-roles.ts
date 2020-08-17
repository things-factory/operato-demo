import { MigrationInterface, QueryRunner, getRepository } from 'typeorm'

import { Domain } from '@things-factory/shell'
import { User, Role } from '@things-factory/auth-base'

const SEED_ROLE = ['ACCOUNTING', 'POS', 'MMS', 'ERP', 'LMD', 'FREIGHT', 'FLEET']

export class roles1597668561695 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    const userRepo = getRepository(User)
    const roleRepository = getRepository(Role)

    const domains = await getRepository(Domain).find({
      systemFlag: false
    })

    return Promise.all(
      domains.map(async (domain: Domain) => {
        const { subdomain } = domain
        const admin = await userRepo.findOne({ email: `admin@${subdomain}.com` })

        return Promise.all(
          SEED_ROLE.map(async seed => {
            await roleRepository.save({
              domain,
              name: seed,
              updater: admin,
              creator: admin
            })
          })
        )
      })
    )
  }

  public async down(queryRunner: QueryRunner): Promise<any> {}
}
