import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterAuthDto, Role } from './dto/req/register-auth.dto';
import { LoginAuthrDto } from './dto/req/login-auth.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  // Mock response data
  const mockUserResponse = {
    user_id: 1,
    email: 'test@example.com',
    name: 'Test User',
    role: Role.USER,
    created_at: new Date('2024-01-01T00:00:00.000Z'),
  };

  const mockLoginResponse = {
    access_token: 'jwt.token.here',
  };

  beforeEach(async () => {
    // Create mock AuthService
    const mockAuthService = {
      register: jest.fn(),
      login: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerDto: RegisterAuthDto = {
      email: 'newuser@example.com',
      password: 'password123',
      name: 'New User',
      role: 'user' as Role,
    };

    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should successfully register a new user', async () => {
      // Arrange
      authService.register.mockResolvedValue(mockUserResponse);

      // Act
      const result = await controller.register(registerDto);

      // Assert
      expect(authService.register).toHaveBeenCalledWith(registerDto);
      expect(authService.register).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockUserResponse);
    });

    it('should throw BadRequestException when user already exists', async () => {
      // Arrange
      const errorMessage = 'User with this email already exists';
      authService.register.mockRejectedValue(
        new BadRequestException(errorMessage),
      );

      // Act & Assert
      await expect(controller.register(registerDto)).rejects.toThrow(
        new BadRequestException(errorMessage),
      );
      expect(authService.register).toHaveBeenCalledWith(registerDto);
      expect(authService.register).toHaveBeenCalledTimes(1);
    });

    it('should handle service errors during registration', async () => {
      // Arrange
      const errorMessage = 'Internal server error';
      authService.register.mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(controller.register(registerDto)).rejects.toThrow(
        errorMessage,
      );
      expect(authService.register).toHaveBeenCalledWith(registerDto);
      expect(authService.register).toHaveBeenCalledTimes(1);
    });

    it('should pass the correct DTO to the service', async () => {
      // Arrange
      authService.register.mockResolvedValue(mockUserResponse);
      const customRegisterDto: RegisterAuthDto = {
        email: 'custom@example.com',
        password: 'customPassword',
        name: 'Custom User',
        role: 'admin' as Role,
      };

      // Act
      await controller.register(customRegisterDto);

      // Assert
      expect(authService.register).toHaveBeenCalledWith(customRegisterDto);
      expect(authService.register).not.toHaveBeenCalledWith(registerDto);
    });
  });

  describe('login', () => {
    const loginDto: LoginAuthrDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should successfully login a user with valid credentials', async () => {
      // Arrange
      authService.login.mockResolvedValue(mockLoginResponse);

      // Act
      const result = await controller.login(loginDto);

      // Assert
      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(authService.login).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockLoginResponse);
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      // Arrange
      const errorMessage = 'Invalid email or password';
      authService.login.mockRejectedValue(
        new UnauthorizedException(errorMessage),
      );

      // Act & Assert
      await expect(controller.login(loginDto)).rejects.toThrow(
        new UnauthorizedException(errorMessage),
      );
      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(authService.login).toHaveBeenCalledTimes(1);
    });

    it('should handle service errors during login', async () => {
      // Arrange
      const errorMessage = 'Database connection failed';
      authService.login.mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(controller.login(loginDto)).rejects.toThrow(errorMessage);
      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(authService.login).toHaveBeenCalledTimes(1);
    });

    it('should pass the correct DTO to the service', async () => {
      // Arrange
      authService.login.mockResolvedValue(mockLoginResponse);
      const customLoginDto: LoginAuthrDto = {
        email: 'different@example.com',
        password: 'differentPassword',
      };

      // Act
      await controller.login(customLoginDto);

      // Assert
      expect(authService.login).toHaveBeenCalledWith(customLoginDto);
      expect(authService.login).not.toHaveBeenCalledWith(loginDto);
    });

    it('should return the access token from the service', async () => {
      // Arrange
      const customTokenResponse = {
        access_token: 'custom.jwt.token.here',
      };
      authService.login.mockResolvedValue(customTokenResponse);

      // Act
      const result = await controller.login(loginDto);

      // Assert
      expect(result).toEqual(customTokenResponse);
      expect(result.access_token).toBe('custom.jwt.token.here');
    });
  });

  describe('controller methods', () => {
    it('should have register method defined', () => {
      expect(controller.register).toBeDefined();
      expect(typeof controller.register).toBe('function');
    });

    it('should have login method defined', () => {
      expect(controller.login).toBeDefined();
      expect(typeof controller.login).toBe('function');
    });
  });

  describe('error propagation', () => {
    it('should propagate BadRequestException from register service', async () => {
      // Arrange
      const registerDto: RegisterAuthDto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        role: 'user' as Role,
      };
      const badRequestException = new BadRequestException(
        'Custom error message',
      );
      authService.register.mockRejectedValue(badRequestException);

      // Act & Assert
      await expect(controller.register(registerDto)).rejects.toThrow(
        badRequestException,
      );
    });

    it('should propagate UnauthorizedException from login service', async () => {
      // Arrange
      const loginDto: LoginAuthrDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };
      const unauthorizedException = new UnauthorizedException(
        'Custom unauthorized message',
      );
      authService.login.mockRejectedValue(unauthorizedException);

      // Act & Assert
      await expect(controller.login(loginDto)).rejects.toThrow(
        unauthorizedException,
      );
    });
  });
});
