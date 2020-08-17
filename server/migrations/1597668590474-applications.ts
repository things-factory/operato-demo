import { MigrationInterface, QueryRunner, getRepository } from 'typeorm'

import { Domain } from '@things-factory/shell'
import { User } from '@things-factory/auth-base'
import { Application, ApplicationStatus } from '@things-factory/oauth2-base'

const SEED_APP = [
  {
    name: 'Operato MMS',
    description: 'Operato MMS Application',
    email: 'heartyoh@hatiolab.com',
    url: 'http://operato-m.com:3000',
    icon: '',
    redirectUrl: 'http://operato-m.com:3000/callback-operato',
    webhook: 'http://operato-m.com:3000/webhook-operato'
  }
]

export class applications1597668590474 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    const repository = getRepository(Application)
    const userRepository = getRepository(User)

    const admin = await userRepository.findOne({ email: 'admin@hatiolab.com' })

    try {
      SEED_APP.forEach(async application => {
        await repository.save({
          ...application,
          appKey: Application.generateAppKey(),
          appSecret: Application.generateAppSecret(),
          status: ApplicationStatus.ACTIVATED,
          updater: admin,
          creator: admin
        })
      })
    } catch (e) {
      console.error(e)
    }
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    const repository = getRepository(Application)
    SEED_APP.reverse().forEach(async application => {
      let record = await repository.findOne({ name: application.name })
      await repository.remove(record)
    })
  }
}
