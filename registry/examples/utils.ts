import { faker } from '@faker-js/faker'

export function getRandomUser(count = 10) {
  return Array.from({ length: count }, () => {
    const firstName = faker.person.firstName()
    const lastName = faker.person.lastName()

    return {
      id: faker.string.uuid(),
      name: `${firstName} ${lastName}`,
      avatar: faker.image.avatar(),
    }
  })
}

export function generateFullName(): string {
  const firstName = faker.person.firstName()
  const lastName = faker.person.lastName()
  return `${firstName} ${lastName}`
}
