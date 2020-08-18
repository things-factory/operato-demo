import { MigrationInterface, QueryRunner, getRepository, In } from 'typeorm'

import { Domain } from '@things-factory/shell'
import { User, UserStatus, Role } from '@things-factory/auth-base'
import { Application, ApplicationStatus } from '@things-factory/oauth2-base'

const SEED_APP = [
  {
    name: 'Operato MMS',
    description: 'Operato MMS Application',
    email: 'admin@storensend.com',
    url: 'http://operato-m.com:3000',
    icon: '',
    redirectUrl: 'http://operato-m.com:3000/callback-operato',
    webhook: 'http://operato-m.com:3000/webhook-operato',
    roles: ['MMS']
  },
  {
    name: 'Operato POS',
    description: 'Operato POS Application',
    email: 'admin@pakej.com',
    url: 'http://operato-p.com:4000',
    icon: '',
    redirectUrl: 'http://operato-p.com:4000/callback-operato',
    webhook: 'http://operato-p.com:4000/webhook-operato',
    roles: ['POS']
  }
]

export class applications1597668590474 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    const domainRepo = getRepository(Domain)
    const userRepo = getRepository(User)
    const roleRepo = getRepository(Role)
    const appRepo = getRepository(Application)

    const domains = await domainRepo.find({
      systemFlag: false
    })

    return Promise.all(
      SEED_APP.map(async application => {
        const admin = await userRepo.findOne({ email: application.email })
        const appKey = Application.generateAppKey()

        await appRepo.save({
          ...application,
          appKey,
          appSecret: Application.generateAppSecret(),
          status: ApplicationStatus.ACTIVATED,
          updater: admin,
          creator: admin
        })

        const app: Application = await appRepo.findOne({ appKey })

        return Promise.all(
          domains.map(async (domain: Domain) => {
            const roles = await roleRepo.find({
              name: In(application.roles),
              domain
            })

            const { subdomain } = domain
            const email = `${appKey}@${subdomain}`

            await userRepo.save({
              email,
              name: app.name,
              userType: 'application',
              status: UserStatus.ACTIVATED,
              roles,
              updater: admin,
              creator: admin
            })

            const appUser: User = await userRepo.findOne({ email })

            appUser.domain = Promise.resolve(domain)
            appUser.domains = Promise.resolve([domain])
            await getRepository(User).save(appUser)

            appUser.password = Application.generateAccessToken(domain, appUser, appKey)
            await userRepo.save(appUser)
          })
        )
      })
    )
  }

  public async down(queryRunner: QueryRunner): Promise<any> {}
}
