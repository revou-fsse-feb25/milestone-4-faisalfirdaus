import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { RegisterAuthDto, Role } from './dto/req/register-auth.dto';
import { LoginAuthrDto } from './dto/req/login-auth.dto';

// Mock bcrypt
jest.mock('bcrypt');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

  // Mock user data
  const mockUser = {
    user_id: 1,
    email: 'test@example.com',
    password: 'hashedPassword123',
    name: 'Test User',
    role: Role.USER,
    created_at: new Date('2024-01-01T00:00:00.000Z'),
  };

  const mockUserWithoutPassword = {
    user_id: 1,
    email: 'test@example.com',
    name: 'Test User',
    role: Role.USER,
    created_at: new Date('2024-01-01T00:00:00.000Z'),
  };

  beforeEach(async () => {
    // Create mock functions
    const mockUsersService = {
      getUserByEmail: jest.fn(),
      createUser: jest.fn(),
    };

    const mockJwtService = {
      sign: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerDto: RegisterAuthDto = {
      email: 'newuser@example.com',
      password: 'password123',
      name: 'New User',
      role: Role.USER,
    };

    it('should successfully register a new user', async () => {
      // Arrange
      usersService.getUserByEmail.mockResolvedValue(null);
      usersService.createUser.mockResolvedValue(mockUser);

      // Act
      const result = await service.register(registerDto);

      // Assert
      expect(usersService.getUserByEmail).toHaveBeenCalledWith(
        registerDto.email,
      );
      expect(usersService.createUser).toHaveBeenCalledWith({
        email: registerDto.email,
        password: registerDto.password,
        name: registerDto.name,
        role: registerDto.role,
      });
      expect(result).toEqual(mockUserWithoutPassword);
      expect(result).not.toHaveProperty('password');
    });

    it('should throw BadRequestException if user already exists', async () => {
      // Arrange
      usersService.getUserByEmail.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(service.register(registerDto)).rejects.toThrow(
        new BadRequestException('User with this email already exists'),
      );
      expect(usersService.getUserByEmail).toHaveBeenCalledWith(
        registerDto.email,
      );
      expect(usersService.createUser).not.toHaveBeenCalled();
    });

    it('should handle errors from userService.createUser', async () => {
      // Arrange
      usersService.getUserByEmail.mockResolvedValue(null);
      usersService.createUser.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(service.register(registerDto)).rejects.toThrow(
        'Database error',
      );
      expect(usersService.getUserByEmail).toHaveBeenCalledWith(
        registerDto.email,
      );
      expect(usersService.createUser).toHaveBeenCalledWith({
        email: registerDto.email,
        password: registerDto.password,
        name: registerDto.name,
        role: registerDto.role,
      });
    });
  });

  describe('login', () => {
    const loginDto: LoginAuthrDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    const mockJwtToken = 'jwt.token.here';

    it('should successfully login with valid credentials', async () => {
      // Arrange
      usersService.getUserByEmail.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(true as never);
      jwtService.sign.mockReturnValue(mockJwtToken);

      // Act
      const result = await service.login(loginDto);

      // Assert
      expect(usersService.getUserByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginDto.password,
        mockUser.password,
      );
      expect(jwtService.sign).toHaveBeenCalledWith({
        email: mockUser.email,
        sub: mockUser.user_id,
        role: mockUser.role,
      });
      expect(result).toEqual({
        access_token: mockJwtToken,
      });
    });

    it('should throw UnauthorizedException if user does not exist', async () => {
      // Arrange
      usersService.getUserByEmail.mockResolvedValue(null);

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(
        new UnauthorizedException('Invalid email or password'),
      );
      expect(usersService.getUserByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      // Arrange
      usersService.getUserByEmail.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(false as never);

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(
        new UnauthorizedException('Invalid email or password'),
      );
      expect(usersService.getUserByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginDto.password,
        mockUser.password,
      );
      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('should handle bcrypt.compare errors', async () => {
      // Arrange
      usersService.getUserByEmail.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockRejectedValue(
        new Error('Bcrypt error') as never,
      );

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow('Bcrypt error');
      expect(usersService.getUserByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginDto.password,
        mockUser.password,
      );
      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('should handle jwtService.sign errors', async () => {
      // Arrange
      usersService.getUserByEmail.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(true as never);
      jwtService.sign.mockImplementation(() => {
        throw new Error('JWT error');
      });

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow('JWT error');
      expect(usersService.getUserByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginDto.password,
        mockUser.password,
      );
      expect(jwtService.sign).toHaveBeenCalledWith({
        email: mockUser.email,
        sub: mockUser.user_id,
        role: mockUser.role,
      });
    });
  });

  describe('edge cases', () => {
    it('should handle getUserByEmail throwing an error during register', async () => {
      // Arrange
      const registerDto: RegisterAuthDto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        role: Role.USER,
      };
      usersService.getUserByEmail.mockRejectedValue(
        new Error('Database connection error'),
      );

      // Act & Assert
      await expect(service.register(registerDto)).rejects.toThrow(
        'Database connection error',
      );
      expect(usersService.getUserByEmail).toHaveBeenCalledWith(
        registerDto.email,
      );
      expect(usersService.createUser).not.toHaveBeenCalled();
    });

    it('should handle getUserByEmail throwing an error during login', async () => {
      // Arrange
      const loginDto: LoginAuthrDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      usersService.getUserByEmail.mockRejectedValue(
        new Error('Database connection error'),
      );

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(
        'Database connection error',
      );
      expect(usersService.getUserByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(jwtService.sign).not.toHaveBeenCalled();
    });
  });
});
