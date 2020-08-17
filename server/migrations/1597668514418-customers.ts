import { MigrationInterface, QueryRunner, getRepository } from 'typeorm'

import { Domain } from '@things-factory/shell'
import { User } from '@things-factory/auth-base'

const SEED_DOMAIN = [
  {
    name: 'Maybank',
    subdomain: 'maybank'
  },
  {
    name: 'Tenaga Nasional',
    subdomain: 'tenaga'
  },
  {
    name: 'Petronas Chemicals',
    subdomain: 'petronas'
  },
  {
    name: 'Axiata Group',
    subdomain: 'axiato'
  }
]

const saveUser = async (repository, domain, email, password, userType) => {
  await repository.save({
    name: userType,
    email,
    password: User.encode(password),
    userType
  })

  var user: User = await repository.findOne({ email })
  user.domain = Promise.resolve(domain)
  user.domains = Promise.resolve([domain])
  await repository.save(user)
}

export class customers1597668514418 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    const domainRepo = getRepository(Domain)
    const userRepo = getRepository(User)

    return Promise.all(
      SEED_DOMAIN.map(async seed => {
        const { subdomain } = seed
        await domainRepo.save(seed)

        const domain = await domainRepo.findOne({ subdomain })

        await saveUser(userRepo, domain, `admin@${subdomain}.com`, 'admin', 'admin')
        await saveUser(userRepo, domain, `user@${subdomain}.com`, 'user', 'user')
      })
    )
  }

  public async down(queryRunner: QueryRunner): Promise<any> {}
}
