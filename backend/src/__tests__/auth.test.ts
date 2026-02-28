import request from 'supertest';
import app from '../app';

const BASE = '/api/auth';

const validUser = {
  email: 'alice@example.com',
  username: 'alice',
  password: 'Password123',
  firstName: 'Alice',
  lastName: 'Smith',
};

describe('POST /api/auth/register', () => {
  it('returns 201 with token and user on valid input', async () => {
    const res = await request(app).post(`${BASE}/register`).send(validUser);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toMatchObject({
      email: 'alice@example.com',
      username: 'alice',
    });
  });

  it('returns 400 when required fields are missing', async () => {
    const res = await request(app).post(`${BASE}/register`).send({ email: 'x@x.com' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 409 on duplicate email', async () => {
    await request(app).post(`${BASE}/register`).send(validUser);
    const res = await request(app).post(`${BASE}/register`).send({
      ...validUser,
      username: 'different',
    });
    expect(res.status).toBe(409);
  });

  it('returns 409 on duplicate username', async () => {
    await request(app).post(`${BASE}/register`).send(validUser);
    const res = await request(app).post(`${BASE}/register`).send({
      ...validUser,
      email: 'different@example.com',
    });
    expect(res.status).toBe(409);
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await request(app).post(`${BASE}/register`).send(validUser);
  });

  it('returns 200 with token on valid credentials', async () => {
    const res = await request(app).post(`${BASE}/login`).send({
      email: validUser.email,
      password: validUser.password,
    });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('email', validUser.email);
  });

  it('returns 401 on wrong password', async () => {
    const res = await request(app).post(`${BASE}/login`).send({
      email: validUser.email,
      password: 'WrongPassword!',
    });
    expect(res.status).toBe(401);
  });

  it('returns 401 on non-existent email', async () => {
    const res = await request(app).post(`${BASE}/login`).send({
      email: 'nobody@example.com',
      password: 'Password123',
    });
    expect(res.status).toBe(401);
  });

  it('returns 400 when fields are missing', async () => {
    const res = await request(app).post(`${BASE}/login`).send({ email: validUser.email });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/logout', () => {
  it('returns 200 with a token (JWT is stateless)', async () => {
    const reg = await request(app).post(`${BASE}/register`).send(validUser);
    const token = reg.body.token;

    const res = await request(app)
      .post(`${BASE}/logout`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message');
  });

  it('returns 401 without a token', async () => {
    const res = await request(app).post(`${BASE}/logout`);
    expect(res.status).toBe(401);
  });
});

describe('GET /api/auth/me', () => {
  it('returns 200 with user data when authenticated', async () => {
    const reg = await request(app).post(`${BASE}/register`).send(validUser);
    const token = reg.body.token;

    const res = await request(app)
      .get(`${BASE}/me`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      email: validUser.email,
      username: validUser.username,
    });
  });

  it('returns 401 without a token', async () => {
    const res = await request(app).get(`${BASE}/me`);
    expect(res.status).toBe(401);
  });

  it('returns 401 with an invalid token', async () => {
    const res = await request(app)
      .get(`${BASE}/me`)
      .set('Authorization', 'Bearer notavalidtoken');
    expect(res.status).toBe(401);
  });
});
