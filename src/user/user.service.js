import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import ApiError from '../errors/ApiError.js';
import config from '../../config/config.js';

const {
  auth: { SECRET, JWT_EXPIRE_TIME },
} = config;

export default class UserService {
  constructor(repository, patientService) {
    this.repository = repository;
    this.patientService = patientService;
  }

  verifyEmail = async (email) => {
    const user = await this.repository.getUserByEmail(email);
    if (user) {
      return false;
    }
    return true;
  };

  authenticate = async (user) => {
    const userEntity = await this.getUserByEmail(user.email);

    const isValidPassword = bcrypt.compareSync(
      user.password,
      userEntity.password,
    );

    if (!isValidPassword) {
      throw new ApiError(401, 'Invalid password');
    }

    const token = jwt.sign({ id: userEntity.id }, SECRET, {
      expiresIn: JWT_EXPIRE_TIME,
    });

    return { ...userEntity, token };
  };

  createUser = async (data) => {
    // basically we can create only patients this way
    const userData = {
      email: data.email,
      password: bcrypt.hashSync(data.password, 8),
      role: 'patient',
    };

    const isValidEmail = await this.verifyEmail(data.email);

    if (!isValidEmail) {
      throw new ApiError(400, 'Email is already exists');
    }

    const patientData = {
      name: data.name,
      gender: data.gender,
      birth_date: data.birthDate,
      email: data.email,
    };

    const user = await this.repository.createUser(userData);// лучше заключить в один метод в репозитории в транзакцию
    patientData.user_id = user.id;

    await this.patientService.addPatient(patientData); // вместе с этим методом
  };

  getUserByEmail = async (email) => {
    const user = await this.repository.getUserByEmail(email);

    if (!user) {
      throw new ApiError(404, `User for ${email} not found`);
    }

    return user;
  };

  getUserById = async (id) => {
    const user = await this.repository.getUserById(id);

    if (!user) {
      throw new ApiError(404, 'User not exists');
    }

    return user;
  };

  /* not used */
  updateUser = async (id, data) => {
    await this.repository.updateUser(id, data);
  };

  /* not used */
  deleteUser = async (userId) => {
    await this.repository.deleteUser(userId);
  };
}
