/**
 * Unit Tests for Email Utilities
 */

const mockSendMail = jest.fn();
const mockCreateTransport = jest.fn(() => ({
  sendMail: mockSendMail,
}));

jest.mock('nodemailer', () => ({
  __esModule: true,
  default: {
    createTransport: mockCreateTransport,
  },
}));

import { sendEmail } from '@/app/lib/email';

describe('email utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSendMail.mockResolvedValue({ messageId: 'message-123' });
  });

  it('creates a transport with the configured SMTP settings', async () => {
    const result = await sendEmail({
      to: 'student@example.com',
      subject: 'Test Email',
      html: '<p>Hello</p>',
      text: 'Hello',
    });

    expect(mockCreateTransport).toHaveBeenCalledWith({
      host: process.env.EMAIL_HOST,
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    expect(mockSendMail).toHaveBeenCalledWith({
      from: process.env.EMAIL_FROM,
      to: 'student@example.com',
      subject: 'Test Email',
      html: '<p>Hello</p>',
      text: 'Hello',
    });

    expect(result).toEqual({
      success: true,
      messageId: 'message-123',
    });
  });

  it('returns a failed result when the transport cannot send the message', async () => {
    mockSendMail.mockRejectedValue(new Error('SMTP unavailable'));

    const result = await sendEmail({
      to: 'student@example.com',
      subject: 'Test Email',
      html: '<p>Hello</p>',
      text: 'Hello',
    });

    expect(result).toEqual({
      success: false,
      error: 'SMTP unavailable',
    });
  });
});
