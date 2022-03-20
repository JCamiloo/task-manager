const request = require('supertest');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/user');

const userOneId = new mongoose.Types.ObjectId();

const userOne = {
  _id: userOneId,
  name: "Juan Camilo",
  email: "juan.osorio15@gmail.com",
  password: "juan1234",
  tokens: [{
    token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET)
  }]
}

beforeEach(async () => {
  await User.deleteMany();
  await new User(userOne).save();
});

test('Should signup a new user', async () => {
  const response = await request(app)
    .post('/user')
    .send({
      name: 'Juan',
      email: 'test@test.com',
      password: 'test1234'
    }).expect(201);
  
  const user = await User.findById(response.body.user.id);
  expect(user).not.toBeNull();
  expect(user.password).not.toBe('test1234');
});

test('Should login existing user', async () => {
  const response = await request(app)
    .post('/user/login')
    .send({
      email: userOne.email,
      password: userOne.password
    }).expect(200);

  const user = await User.findById(userOneId);
  expect(response.body.token).toBe(user.tokens[1].token);
});

test('Should not login nonexisting user', async () => {
  await request(app)
    .post('/user/login')
    .send({
      email: userOne.email,
      password: 'thisisnotmypass'
    }).expect(400);
});

test('Should get profile for user', async () => {
  await request(app)
    .get('/user/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);
});

test('Should not get profile unauthenticated user', async () => {
  await request(app)
    .get('/user/me')
    .send()
    .expect(401);
});

test('Should delete account for a user', async () => {
  await request(app)
    .delete('/user/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  const user = await User.findById(userOneId);
  expect(user).toBeNull();
});

test('Should not delete account for a user', async () => {
  await request(app)
    .delete('/user/me')
    .send()
    .expect(401);
});
