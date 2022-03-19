const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/user');

const userOne = {
  name: "Juan Camilo",
  email: "juan.osorio15@gmail.com",
  password: "juan1234"
}

beforeEach(async () => {
  await User.deleteMany();
  await new User(userOne).save();
});

test('Should signup a new user', async () => {
  await request(app)
    .post('/user')
    .send({
      name: 'Juan',
      email: 'test@test.com',
      password: 'test1234'
    }).expect(201);
});
