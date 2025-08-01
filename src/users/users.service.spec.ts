import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterAuthDto } from 'src/auth/dto/req/register-auth.dto';
import { UpdateUserDto } from './dto/req/update-user.dto';
import { Role } from 'src/auth/dto/req/register-auth.dto';

// Mock bcrypt
jest.mock('bcrypt');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('UsersService', () => {
  let service: UsersService;
  let prismaService: any;

  // Mock user data matching Prisma User model
  const mockUser = {
    user_id: 1,
    name: 'Test User',
    email: 'test@example.com',
    role: Role.USER,
    password: 'hashedPassword123',
    created_at: new Date('2024-01-01T00:00:00.000Z'),
  };

  const mockUserWithoutPassword = {
    user_id: 1,
    name: 'Test User',
    email: 'test@example.com',
    role: Role.USER,
    created_at: new Date('2024-01-01T00:00:00.000Z'),
  };

  const mockUpdatedUser = {
    user_id: 1,
    name: 'Updated Test User',
    email: 'test@example.com',
    role: Role.USER,
    password: 'hashedPassword123',
    created_at: new Date('2024-01-01T00:00:00.000Z'),
  };

  beforeEach(async () => {
    // Create mock PrismaService with proper typing
    const mockPrismaService = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prismaService = module.get(PrismaService) as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    const userInput = { user_id: 1 };

    it('should successfully get user profile without password', async () => {
      // Arrange
      prismaService.user.findUnique.mockResolvedValue(mockUser);

      // Act
      const result = await service.getProfile(userInput);

      // Assert
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { user_id: userInput.user_id },
      });
      expect(result).toEqual(mockUserWithoutPassword);
      expect(result).not.toHaveProperty('password');
    });

    it('should throw NotFoundException when user does not exist', async () => {
      // Arrange
      prismaService.user.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.getProfile(userInput)).rejects.toThrow(
        new NotFoundException('User not found'),
      );
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { user_id: userInput.user_id },
      });
    });

    it('should handle database errors', async () => {
      // Arrange
      const dbError = new Error('Database connection failed');
      prismaService.user.findUnique.mockRejectedValue(dbError);

      // Act & Assert
      await expect(service.getProfile(userInput)).rejects.toThrow(dbError);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { user_id: userInput.user_id },
      });
    });
  });

  describe('updateProfile', () => {
    const userInput = { user_id: 1 };
    const updateData: UpdateUserDto = {
      name: 'Updated Test User',
    };

    it('should successfully update user profile', async () => {
      // Arrange
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      prismaService.user.update.mockResolvedValue(mockUpdatedUser);

      // Act
      const result = await service.updateProfile(userInput, updateData);

      // Assert
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { user_id: userInput.user_id },
      });
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { user_id: userInput.user_id },
        data: updateData,
      });
      expect(result).toEqual({
        user_id: 1,
        name: 'Updated Test User',
        email: 'test@example.com',
        role: Role.USER,
        created_at: new Date('2024-01-01T00:00:00.000Z'),
      });
      expect(result).not.toHaveProperty('password');
    });

    it('should throw NotFoundException when user does not exist', async () => {
      // Arrange
      prismaService.user.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.updateProfile(userInput, updateData),
      ).rejects.toThrow(new NotFoundException('User not found'));
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { user_id: userInput.user_id },
      });
      expect(prismaService.user.update).not.toHaveBeenCalled();
    });

    it('should handle database errors during update', async () => {
      // Arrange
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      const dbError = new Error('Update failed');
      prismaService.user.update.mockRejectedValue(dbError);

      // Act & Assert
      await expect(
        service.updateProfile(userInput, updateData),
      ).rejects.toThrow(dbError);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { user_id: userInput.user_id },
      });
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { user_id: userInput.user_id },
        data: updateData,
      });
    });

    it('should update with multiple fields', async () => {
      // Arrange
      const multiUpdateData: UpdateUserDto = {
        name: 'New Name',
        email: 'newemail@example.com',
      };
      const multiUpdatedUser = {
        ...mockUser,
        name: 'New Name',
        email: 'newemail@example.com',
      };

      prismaService.user.findUnique.mockResolvedValue(mockUser);
      prismaService.user.update.mockResolvedValue(multiUpdatedUser);

      // Act
      const result = await service.updateProfile(userInput, multiUpdateData);

      // Assert
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { user_id: userInput.user_id },
        data: multiUpdateData,
      });
      expect(result.name).toBe('New Name');
      expect(result.email).toBe('newemail@example.com');
      expect(result).not.toHaveProperty('password');
    });
  });

  describe('createUser', () => {
    const registerDto: RegisterAuthDto = {
      name: 'New User',
      email: 'newuser@example.com',
      password: 'plainPassword123',
      role: Role.USER,
    };

    const hashedPassword = 'hashedPassword123';

    it('should successfully create a new user with hashed password', async () => {
      // Arrange
      mockedBcrypt.hash.mockResolvedValue(hashedPassword as never);
      prismaService.user.create.mockResolvedValue(mockUser);

      // Act
      const result = await service.createUser(registerDto);

      // Assert
      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          name: registerDto.name,
          email: registerDto.email,
          password: hashedPassword,
          role: registerDto.role,
        },
      });
      expect(result).toEqual(mockUser);
    });

    it('should handle bcrypt hashing errors', async () => {
      // Arrange
      const hashError = new Error('Hashing failed');
      mockedBcrypt.hash.mockRejectedValue(hashError as never);

      // Act & Assert
      await expect(service.createUser(registerDto)).rejects.toThrow(hashError);
      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
      expect(prismaService.user.create).not.toHaveBeenCalled();
    });

    it('should handle database creation errors', async () => {
      // Arrange
      mockedBcrypt.hash.mockResolvedValue(hashedPassword as never);
      const dbError = new Error('User creation failed');
      prismaService.user.create.mockRejectedValue(dbError);

      // Act & Assert
      await expect(service.createUser(registerDto)).rejects.toThrow(dbError);
      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          name: registerDto.name,
          email: registerDto.email,
          password: hashedPassword,
          role: registerDto.role,
        },
      });
    });

    it('should create user with different roles', async () => {
      // Arrange
      const adminRegisterDto: RegisterAuthDto = {
        ...registerDto,
        role: Role.ADMIN,
      };
      const adminUser = { ...mockUser, role: Role.ADMIN };

      mockedBcrypt.hash.mockResolvedValue(hashedPassword as never);
      prismaService.user.create.mockResolvedValue(adminUser);

      // Act
      const result = await service.createUser(adminRegisterDto);

      // Assert
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          name: adminRegisterDto.name,
          email: adminRegisterDto.email,
          password: hashedPassword,
          role: Role.ADMIN,
        },
      });
      expect(result.role).toBe(Role.ADMIN);
    });
  });

  describe('getUserByEmail', () => {
    const email = 'test@example.com';

    it('should successfully get user by email', async () => {
      // Arrange
      prismaService.user.findUnique.mockResolvedValue(mockUser);

      // Act
      const result = await service.getUserByEmail(email);

      // Assert
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null when user is not found', async () => {
      // Arrange
      prismaService.user.findUnique.mockResolvedValue(null);

      // Act
      const result = await service.getUserByEmail(email);

      // Assert
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email },
      });
      expect(result).toBeNull();
    });

    it('should handle database errors', async () => {
      // Arrange
      const dbError = new Error('Database query failed');
      prismaService.user.findUnique.mockRejectedValue(dbError);

      // Act & Assert
      await expect(service.getUserByEmail(email)).rejects.toThrow(dbError);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email },
      });
    });
  });

  describe('getUserById', () => {
    const userId = 1;

    it('should successfully get user by id', async () => {
      // Arrange
      prismaService.user.findUnique.mockResolvedValue(mockUser);

      // Act
      const result = await service.getUserById(userId);

      // Assert
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { user_id: userId },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null when user is not found', async () => {
      // Arrange
      prismaService.user.findUnique.mockResolvedValue(null);

      // Act
      const result = await service.getUserById(userId);

      // Assert
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { user_id: userId },
      });
      expect(result).toBeNull();
    });

    it('should handle database errors', async () => {
      // Arrange
      const dbError = new Error('Database query failed');
      prismaService.user.findUnique.mockRejectedValue(dbError);

      // Act & Assert
      await expect(service.getUserById(userId)).rejects.toThrow(dbError);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { user_id: userId },
      });
    });
  });

  describe('edge cases', () => {
    it('should handle getUserById with different user IDs', async () => {
      // Arrange
      const differentUser = {
        ...mockUser,
        user_id: 999,
        email: 'different@example.com',
      };
      prismaService.user.findUnique.mockResolvedValue(differentUser);

      // Act
      const result = await service.getUserById(999);

      // Assert
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { user_id: 999 },
      });
      expect(result).toEqual(differentUser);
    });

    it('should handle getUserByEmail with different emails', async () => {
      // Arrange
      const differentEmail = 'different@example.com';
      const differentUser = { ...mockUser, email: differentEmail };
      prismaService.user.findUnique.mockResolvedValue(differentUser);

      // Act
      const result = await service.getUserByEmail(differentEmail);

      // Assert
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: differentEmail },
      });
      expect(result).toEqual(differentUser);
    });

    it('should handle updateProfile with empty update data', async () => {
      // Arrange
      const userInput = { user_id: 1 };
      const emptyUpdateData: UpdateUserDto = {};

      prismaService.user.findUnique.mockResolvedValue(mockUser);
      prismaService.user.update.mockResolvedValue(mockUser);

      // Act
      const result = await service.updateProfile(userInput, emptyUpdateData);

      // Assert
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { user_id: userInput.user_id },
        data: emptyUpdateData,
      });
      expect(result).not.toHaveProperty('password');
    });
  });
});
