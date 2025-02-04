import userService from './index.js';

export const setUserIdFromReq = async (req, res, next) => {//зачем перекидывать id из одного поля в другое
  if (req.user.id) {
    req.params.userId = req.user.id;
  }
  next();
};

export const getById = async (req, res, next) => {
  const user = await userService.getUserById(req.params.userId);//здесь можно сразу взять его из req.user.id

  delete user.password;

  res.status(200).json({
    data: { ...user },
  });
};

export const authenticate = async (req, res, next) => {
  const user = await userService.authenticate(req.body);

  const { token } = user;

  delete user.token;
  delete user.password;

  res.status(200).json({
    message: 'Authenticated',
    token,
    data: { ...user },
  });
};

export const create = async (req, res, next) => {
  await userService.createUser(req.body);
  res.sendStatus(201);
};

export const update = async (req, res, next) => {
  const { userId } = req.user;
  const user = await userService.updateUser(userId);
  res.status(200).json(user);
};

export const remove = async (req, res, next) => {
  const { userId } = req.user;
  await userService.deleteUser(userId);
  res.sendStatus(204);
};
