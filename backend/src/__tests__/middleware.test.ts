import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authenticate, AuthRequest } from '../middleware/authenticate';
import { errorHandler } from '../middleware/errorHandler';
import { requestLogger } from '../middleware/requestLogger';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mockRes() {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
}

function mockNext(): NextFunction {
  return jest.fn();
}

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// ---------------------------------------------------------------------------
// authenticate middleware
// ---------------------------------------------------------------------------

describe('authenticate middleware', () => {
  it('calls next() and sets req.userId with a valid token', () => {
    const token = jwt.sign({ userId: 'abc123' }, JWT_SECRET);
    const req = {
      headers: { authorization: `Bearer ${token}` },
    } as AuthRequest;
    const res = mockRes();
    const next = mockNext();

    authenticate(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.userId).toBe('abc123');
  });

  it('returns 401 when no Authorization header is present', () => {
    const req = { headers: {} } as AuthRequest;
    const res = mockRes();
    const next = mockNext();

    authenticate(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'No token provided' });
  });

  it('returns 401 for an invalid / tampered token', () => {
    const req = {
      headers: { authorization: 'Bearer thisisnotavalidtoken' },
    } as AuthRequest;
    const res = mockRes();
    const next = mockNext();

    authenticate(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token' });
  });

  it('returns 401 for an expired token', () => {
    const token = jwt.sign({ userId: 'abc123' }, JWT_SECRET, { expiresIn: -1 });
    const req = {
      headers: { authorization: `Bearer ${token}` },
    } as AuthRequest;
    const res = mockRes();
    const next = mockNext();

    authenticate(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
  });
});

// ---------------------------------------------------------------------------
// errorHandler middleware
// ---------------------------------------------------------------------------

describe('errorHandler middleware', () => {
  it('responds with the error statusCode and message', () => {
    const err = Object.assign(new Error('Test error'), { statusCode: 422 });
    const req = {} as Request;
    const res = mockRes();
    const next = mockNext();

    errorHandler(err as any, req, res, next);

    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Test error', statusCode: 422 })
    );
  });

  it('defaults to 500 when no statusCode is set', () => {
    const err = new Error('Something went wrong');
    const req = {} as Request;
    const res = mockRes();
    const next = mockNext();

    errorHandler(err as any, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ---------------------------------------------------------------------------
// requestLogger middleware
// ---------------------------------------------------------------------------

describe('requestLogger middleware', () => {
  it('calls next() and does not modify the response', () => {
    const req = { method: 'GET', path: '/api/health' } as Request;
    const res = mockRes();
    const next = mockNext();

    requestLogger(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});
