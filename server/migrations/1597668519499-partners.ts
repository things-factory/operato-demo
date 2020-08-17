import { MigrationInterface, QueryRunner, getRepository } from 'typeorm'

import { Domain } from '@things-factory/shell'
import { User } from '@things-factory/auth-base'

const SEED_DOMAIN = [
  {
    name: 'Store & Send',
    subdomain: 'storensend'
  },
  {
    name: 'Pakej',
    subdomain: 'pakej'
  }
]

const saveUser = async (repository, domain, email, password, userType, creator) => {
  await repository.save({
    name: userType,
    email,
    password: User.encode(password),
    userType,
    updater: creator,
    creator
  })

  var user: User = await repository.findOne({ email })
  user.domain = Promise.resolve(domain)
  user.domains = Promise.resolve([domain])
  await repository.save(user)
}

export class partners1597668519499 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    const domainRepo = getRepository(Domain)
    const userRepo = getRepository(User)

    const admin = await userRepo.findOne({ email: 'admin@hatiolab.com' })

    return Promise.all(
      SEED_DOMAIN.map(async seed => {
        const { subdomain } = seed
        await domainRepo.save(seed)

        const domain = await domainRepo.findOne({ subdomain })

        await saveUser(userRepo, domain, `admin@${subdomain}.com`, 'admin', 'admin', admin)
        await saveUser(userRepo, domain, `developer@${subdomain}.com`, 'developer', 'developer', admin)
      })
    )
  }

  public async down(queryRunner: QueryRunner): Promise<any> {}
}
