const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/user');
const { userOneId, userOne, setupDatabase } = require('./fixtures/db');

beforeEach(setupDatabase);

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

test('Should upload avatar image', async () => {
  await request(app)
    .post('/user/me/avatar')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .attach('avatar', 'tests/fixtures/profile-pic.jpg')
    .expect(200);

  const user = await User.findById(userOneId);
  expect(user.avatar).toEqual(expect.any(Buffer));
});

test('Should update valid user fields', async () => {
  await request(app)
    .patch('/user/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
      name: 'test',
    })
    .expect(200);

  const user = await User.findById(userOneId);
  expect(user.name).toEqual('test');
});

test('Should update valid user fields', async () => {
  await request(app)
    .patch('/user/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
      location: 'Colombia',
    })
    .expect(400);
});
