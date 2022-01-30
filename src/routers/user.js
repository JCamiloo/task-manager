const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const User = require('../models/user');
const auth = require('../middlewares/auth');

const router = new express.Router();

const upload = multer({
  limits: {
    fileSize: 2500000
  },
  fileFilter(req, file, callback) {
    if (!file.originalname.match(/\.(jpg|png)$/)) {
      return callback(new Error('File must be an image'));

    }

    callback(undefined, true);
  }
});

router.post('/user/login', async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );

    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (e) {
    res.status(400).send();
  }
});

router.post('/user/logout', auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(
      (token) => token.token !== req.token
    );

    await req.user.save();
    res.send();
  } catch (error) {
    res.status(500).send();
  }
});

router.post('/user/logout-all', auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send();
  } catch (error) {
    res.status(500).send();
  }
});

router.post('/user', async (req, res) => {
  const user = new User(req.body);

  try {
    await user.save();
    const token = await user.generateAuthToken();

    res.status(201).send({ user, token });
  } catch (error) {
    res.status(400).send(error);
  }
});

router.get('/user/me', auth, async (req, res) => {
  res.send(req.user);
});

router.patch('/user/me', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name', 'email', 'password', 'age'];
  const isValid = updates.every((update) => allowedUpdates.includes(update));

  if (!isValid) {
    return res.status(400).send({ error: 'Invalid updates' });
  }

  try {
    updates.forEach((update) => (req.user[update] = req.body[update]));
    await req.user.save();

    res.send(req.user);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.delete('/user/me', auth, async (req, res) => {
  try {
    await req.user.remove();

    res.send(req.user);
  } catch (error) {
    res.status(500).send();
  }
});

router.post('/user/me/avatar', auth, upload.single('avatar'), async (req, res) => {
  const buffer = await sharp(req.file.buffer)
    .resize({ width: 250, height: 250 })
    .png()
    .toBuffer();
  
  req.user.avatar = buffer;

  await req.user.save();
  res.send();
}, (error, req, res, next) => {
  res.status(400).send({ error: error.message });
});

router.delete('/user/me/avatar', auth, async (req, res) => {
  if (!req.user.avatar) {
    return res.status(404).send();
  }

  req.user.avatar = undefined;
  await req.user.save();
  res.send();
});

router.get('/user/:id/avatar', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user || !user.avatar) {
      throw new Error();
    }

    res.set('Content-Type', 'image/png');
    res.send(user.avatar);
  } catch (error) {
    res.status(404).send();
  }
});

module.exports = router;