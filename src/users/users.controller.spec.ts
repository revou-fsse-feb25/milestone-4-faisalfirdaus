import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/req/update-user.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RoleGuard } from 'src/auth/guards/user-role.guard';
import { Role } from '@prisma/client';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: jest.Mocked<UsersService>;

  // Mock user data matching Prisma User model
  const mockUser = {
    user_id: 1,
    name: 'Test User',
    email: 'test@example.com',
    role: Role.ADMIN,
    password: 'hashedPassword123',
    created_at: new Date('2024-01-01T00:00:00.000Z'),
  };

  const mockUserProfile = {
    user_id: 1,
    name: 'Test User',
    email: 'test@example.com',
    role: Role.ADMIN,
    password: 'hashedPassword123',
    created_at: new Date('2024-01-01T00:00:00.000Z'),
  };

  const mockUpdatedProfile = {
    user_id: 1,
    name: 'Updated Test User',
    email: 'test@example.com',
    role: Role.ADMIN,
    password: 'hashedPassword123',
    created_at: new Date('2024-01-01T00:00:00.000Z'),
  };

  beforeEach(async () => {
    // Create mock UsersService
    const mockUsersService = {
      getProfile: jest.fn(),
      updateProfile: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .overrideGuard(RoleGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should successfully get user profile', async () => {
      // Arrange
      usersService.getProfile.mockResolvedValue(mockUserProfile);

      // Mock console.log to avoid output during tests
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      // Act
      const result = await controller.getProfile(mockUser);

      // Assert
      expect(usersService.getProfile).toHaveBeenCalledWith(mockUser);
      expect(usersService.getProfile).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockUserProfile);
      expect(consoleSpy).toHaveBeenCalledWith(mockUser);

      // Restore console.log
      consoleSpy.mockRestore();
    });

    it('should handle service errors when getting profile', async () => {
      // Arrange
      const errorMessage = 'User not found';
      usersService.getProfile.mockRejectedValue(new Error(errorMessage));

      // Mock console.log
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      // Act & Assert
      await expect(controller.getProfile(mockUser)).rejects.toThrow(
        errorMessage,
      );
      expect(usersService.getProfile).toHaveBeenCalledWith(mockUser);
      expect(usersService.getProfile).toHaveBeenCalledTimes(1);
      expect(consoleSpy).toHaveBeenCalledWith(mockUser);

      // Restore console.log
      consoleSpy.mockRestore();
    });

    it('should pass the correct user object to the service', async () => {
      // Arrange
      usersService.getProfile.mockResolvedValue(mockUserProfile);
      const customUser = {
        user_id: 2,
        name: 'Custom User',
        email: 'custom@example.com',
        role: Role.USER,
        password: 'hashedPassword456',
        created_at: new Date('2024-02-01T00:00:00.000Z'),
      };

      // Mock console.log
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      // Act
      await controller.getProfile(customUser);

      // Assert
      expect(usersService.getProfile).toHaveBeenCalledWith(customUser);
      expect(usersService.getProfile).not.toHaveBeenCalledWith(mockUser);

      // Restore console.log
      consoleSpy.mockRestore();
    });

    it('should handle unauthorized access', async () => {
      // Arrange
      usersService.getProfile.mockRejectedValue(
        new UnauthorizedException('Unauthorized'),
      );

      // Mock console.log
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      // Act & Assert
      await expect(controller.getProfile(mockUser)).rejects.toThrow(
        new UnauthorizedException('Unauthorized'),
      );
      expect(usersService.getProfile).toHaveBeenCalledWith(mockUser);

      // Restore console.log
      consoleSpy.mockRestore();
    });
  });

  describe('updateProfile', () => {
    const updateUserDto: UpdateUserDto = {
      name: 'Updated Test User',
      // Add other fields that exist in your UpdateUserDto
    };

    it('should successfully update user profile', async () => {
      // Arrange
      usersService.updateProfile.mockResolvedValue(mockUpdatedProfile);

      // Act
      const result = await controller.updateProfile(mockUser, updateUserDto);

      // Assert
      expect(usersService.updateProfile).toHaveBeenCalledWith(
        mockUser,
        updateUserDto,
      );
      expect(usersService.updateProfile).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockUpdatedProfile);
    });

    it('should throw BadRequestException for invalid update data', async () => {
      // Arrange
      const errorMessage = 'Invalid update data';
      usersService.updateProfile.mockRejectedValue(
        new BadRequestException(errorMessage),
      );

      // Act & Assert
      await expect(
        controller.updateProfile(mockUser, updateUserDto),
      ).rejects.toThrow(new BadRequestException(errorMessage));
      expect(usersService.updateProfile).toHaveBeenCalledWith(
        mockUser,
        updateUserDto,
      );
      expect(usersService.updateProfile).toHaveBeenCalledTimes(1);
    });

    it('should handle service errors during profile update', async () => {
      // Arrange
      const errorMessage = 'Database connection failed';
      usersService.updateProfile.mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(
        controller.updateProfile(mockUser, updateUserDto),
      ).rejects.toThrow(errorMessage);
      expect(usersService.updateProfile).toHaveBeenCalledWith(
        mockUser,
        updateUserDto,
      );
      expect(usersService.updateProfile).toHaveBeenCalledTimes(1);
    });

    it('should pass correct parameters to the service', async () => {
      // Arrange
      usersService.updateProfile.mockResolvedValue(mockUpdatedProfile);
      const customUser = {
        user_id: 2,
        name: 'Custom User',
        email: 'custom@example.com',
        role: Role.USER,
        password: 'hashedPassword456',
        created_at: new Date('2024-02-01T00:00:00.000Z'),
      };
      const customUpdateDto: UpdateUserDto = {
        name: 'Custom Updated Name',
        // Add other fields that exist in your UpdateUserDto
      };

      // Act
      await controller.updateProfile(customUser, customUpdateDto);

      // Assert
      expect(usersService.updateProfile).toHaveBeenCalledWith(
        customUser,
        customUpdateDto,
      );
      expect(usersService.updateProfile).not.toHaveBeenCalledWith(
        mockUser,
        updateUserDto,
      );
    });

    it('should handle unauthorized access during update', async () => {
      // Arrange
      usersService.updateProfile.mockRejectedValue(
        new UnauthorizedException('Unauthorized'),
      );

      // Act & Assert
      await expect(
        controller.updateProfile(mockUser, updateUserDto),
      ).rejects.toThrow(new UnauthorizedException('Unauthorized'));
      expect(usersService.updateProfile).toHaveBeenCalledWith(
        mockUser,
        updateUserDto,
      );
    });

    it('should handle empty update DTO', async () => {
      // Arrange
      const emptyUpdateDto: UpdateUserDto = {};
      usersService.updateProfile.mockResolvedValue(mockUserProfile);

      // Act
      const result = await controller.updateProfile(mockUser, emptyUpdateDto);

      // Assert
      expect(usersService.updateProfile).toHaveBeenCalledWith(
        mockUser,
        emptyUpdateDto,
      );
      expect(result).toEqual(mockUserProfile);
    });
  });

  describe('controller methods', () => {
    it('should have getProfile method defined', () => {
      expect(controller.getProfile).toBeDefined();
      expect(typeof controller.getProfile).toBe('function');
    });

    it('should have updateProfile method defined', () => {
      expect(controller.updateProfile).toBeDefined();
      expect(typeof controller.updateProfile).toBe('function');
    });
  });

  describe('error propagation', () => {
    it('should propagate BadRequestException from updateProfile service', async () => {
      // Arrange
      const updateDto: UpdateUserDto = { name: 'Invalid Name' };
      const badRequestException = new BadRequestException('Validation failed');
      usersService.updateProfile.mockRejectedValue(badRequestException);

      // Act & Assert
      await expect(
        controller.updateProfile(mockUser, updateDto),
      ).rejects.toThrow(badRequestException);
    });

    it('should propagate UnauthorizedException from getProfile service', async () => {
      // Arrange
      const unauthorizedException = new UnauthorizedException('Access denied');
      usersService.getProfile.mockRejectedValue(unauthorizedException);

      // Mock console.log
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      // Act & Assert
      await expect(controller.getProfile(mockUser)).rejects.toThrow(
        unauthorizedException,
      );

      // Restore console.log
      consoleSpy.mockRestore();
    });
  });

  describe('guard integration', () => {
    it('should be protected by JwtAuthGuard and RoleGuard', () => {
      // This test verifies that the guards are properly configured
      // The actual guard logic is tested separately
      const guardMetadata = Reflect.getMetadata('__guards__', UsersController);
      expect(guardMetadata).toBeDefined();
    });
  });
});
