import { DIContainer } from '@/shared/utils/DIContainer';
import { PrismaClient } from '@prisma/client';

import { UserRepository } from '@/interfaces/UserRepository';
import { CourseRepository } from '@/interfaces/CourseRepository';
import { ModuleRepository } from '@/interfaces/ModuleRepository';
import { LessonRepository } from '@/interfaces/LessonRepository';
import { LessonCommentRepository } from '@/interfaces/LessonCommentRepository';
import { EnrollmentRepository } from '@/interfaces/EnrollmentRepository';
import { PaymentRepository } from '@/interfaces/PaymentRepository';
import { SubscriptionRepository } from '@/interfaces/SubscriptionRepository';
import { CategoryRepository } from '@/interfaces/CategoryRepository';

import { PrismaUserRepository } from '@/repositories/PrismaUserRepository';
import { PrismaCourseRepository } from '@/repositories/PrismaCourseRepository';
import { PrismaModuleRepository } from '@/repositories/PrismaModuleRepository';
import { PrismaLessonRepository } from '@/repositories/PrismaLessonRepository';
import { PrismaLessonCommentRepository } from '@/repositories/PrismaLessonCommentRepository';
import { PrismaEnrollmentRepository } from '@/repositories/PrismaEnrollmentRepository';
import { PrismaPaymentRepository } from '@/repositories/PrismaPaymentRepository';
import { PrismaSubscriptionRepository } from '@/repositories/PrismaSubscriptionRepository';
import { PrismaCategoryRepository } from '@/repositories/PrismaCategoryRepository';

import { CreateUserUseCase } from '@/use-cases/CreateUserUseCase';
import { AuthenticateUserUseCase } from '@/use-cases/AuthenticateUserUseCase';
import { CreateCourseUseCase } from '@/use-cases/CreateCourseUseCase';
import { CreateModuleUseCase } from '@/use-cases/CreateModuleUseCase';
import { CreateLessonUseCase } from '@/use-cases/CreateLessonUseCase';
import { CompleteLessonUseCase } from '@/use-cases/CompleteLessonUseCase';
import { EnrollInCourseUseCase } from '@/use-cases/EnrollInCourseUseCase';
import { CreateOneTimePaymentUseCase } from '@/use-cases/CreateOneTimePaymentUseCase';
import { CreateSubscriptionPaymentUseCase } from '@/use-cases/CreateSubscriptionPaymentUseCase';
import { ProcessStripeWebhookUseCase } from '@/use-cases/ProcessStripeWebhookUseCase';

import { JwtService } from '@/services/JwtService';
import { PasswordService } from '@/services/PasswordService';
import { StripeService } from '@/services/StripeService';
import { S3Service } from '@/services/S3Service';

export function setupDependencies(): DIContainer {
  const container = new DIContainer();

  container.registerSingleton('PrismaClient', () => new PrismaClient());

  container.registerSingleton('JwtService', () => new JwtService());
  container.registerSingleton('PasswordService', () => new PasswordService());
  container.registerSingleton('StripeService', () => new StripeService());
  container.registerSingleton('S3Service', () => new S3Service());

  container.registerSingleton('UserRepository', () => {
    const prisma = container.resolve<PrismaClient>('PrismaClient');
    return new PrismaUserRepository(prisma);
  });

  container.registerSingleton('CourseRepository', () => {
    const prisma = container.resolve<PrismaClient>('PrismaClient');
    return new PrismaCourseRepository(prisma);
  });

  container.registerSingleton('ModuleRepository', () => {
    const prisma = container.resolve<PrismaClient>('PrismaClient');
    return new PrismaModuleRepository(prisma);
  });

  container.registerSingleton('LessonRepository', () => {
    const prisma = container.resolve<PrismaClient>('PrismaClient');
    return new PrismaLessonRepository(prisma);
  });

  container.registerSingleton('LessonCommentRepository', () => {
    const prisma = container.resolve<PrismaClient>('PrismaClient');
    return new PrismaLessonCommentRepository(prisma);
  });

  container.registerSingleton('EnrollmentRepository', () => {
    const prisma = container.resolve<PrismaClient>('PrismaClient');
    return new PrismaEnrollmentRepository(prisma);
  });

  container.registerSingleton('PaymentRepository', () => {
    const prisma = container.resolve<PrismaClient>('PrismaClient');
    return new PrismaPaymentRepository(prisma);
  });

  container.registerSingleton('SubscriptionRepository', () => {
    const prisma = container.resolve<PrismaClient>('PrismaClient');
    return new PrismaSubscriptionRepository(prisma);
  });

  container.registerSingleton('CategoryRepository', () => {
    const prisma = container.resolve<PrismaClient>('PrismaClient');
    return new PrismaCategoryRepository(prisma);
  });

  container.register('CreateUserUseCase', () => {
    const userRepository = container.resolve<UserRepository>('UserRepository');
    const passwordService = container.resolve<PasswordService>('PasswordService');
    return new CreateUserUseCase(userRepository, passwordService);
  });

  container.register('AuthenticateUserUseCase', () => {
    const userRepository = container.resolve<UserRepository>('UserRepository');
    const passwordService = container.resolve<PasswordService>('PasswordService');
    const jwtService = container.resolve<JwtService>('JwtService');
    return new AuthenticateUserUseCase(userRepository, passwordService, jwtService);
  });

  container.register('CreateCourseUseCase', () => {
    const courseRepository = container.resolve<CourseRepository>('CourseRepository');
    const userRepository = container.resolve<UserRepository>('UserRepository');
    return new CreateCourseUseCase(courseRepository, userRepository);
  });

  container.register('CreateModuleUseCase', () => {
    const moduleRepository = container.resolve<ModuleRepository>('ModuleRepository');
    const courseRepository = container.resolve<CourseRepository>('CourseRepository');
    return new CreateModuleUseCase(moduleRepository, courseRepository);
  });

  container.register('CreateLessonUseCase', () => {
    const lessonRepository = container.resolve<LessonRepository>('LessonRepository');
    const moduleRepository = container.resolve<ModuleRepository>('ModuleRepository');
    return new CreateLessonUseCase(lessonRepository, moduleRepository);
  });

  container.register('CompleteLessonUseCase', () => {
    const lessonRepository = container.resolve<LessonRepository>('LessonRepository');
    const enrollmentRepository = container.resolve<EnrollmentRepository>('EnrollmentRepository');
    return new CompleteLessonUseCase(lessonRepository, enrollmentRepository);
  });

  container.register('EnrollInCourseUseCase', () => {
    const enrollmentRepository = container.resolve<EnrollmentRepository>('EnrollmentRepository');
    const courseRepository = container.resolve<CourseRepository>('CourseRepository');
    const userRepository = container.resolve<UserRepository>('UserRepository');
    return new EnrollInCourseUseCase(enrollmentRepository, courseRepository, userRepository);
  });

  container.register('CreateOneTimePaymentUseCase', () => {
    const paymentRepository = container.resolve<PaymentRepository>('PaymentRepository');
    const courseRepository = container.resolve<CourseRepository>('CourseRepository');
    const userRepository = container.resolve<UserRepository>('UserRepository');
    const stripeService = container.resolve<StripeService>('StripeService');
    return new CreateOneTimePaymentUseCase(paymentRepository, courseRepository, userRepository, stripeService);
  });

  container.register('CreateSubscriptionPaymentUseCase', () => {
    const paymentRepository = container.resolve<PaymentRepository>('PaymentRepository');
    const subscriptionRepository = container.resolve<SubscriptionRepository>('SubscriptionRepository');
    const courseRepository = container.resolve<CourseRepository>('CourseRepository');
    const userRepository = container.resolve<UserRepository>('UserRepository');
    const stripeService = container.resolve<StripeService>('StripeService');
    return new CreateSubscriptionPaymentUseCase(
      paymentRepository,
      subscriptionRepository,
      courseRepository,
      userRepository,
      stripeService
    );
  });

  container.register('ProcessStripeWebhookUseCase', () => {
    const paymentRepository = container.resolve<PaymentRepository>('PaymentRepository');
    const subscriptionRepository = container.resolve<SubscriptionRepository>('SubscriptionRepository');
    const enrollmentRepository = container.resolve<EnrollmentRepository>('EnrollmentRepository');
    const stripeService = container.resolve<StripeService>('StripeService');
    return new ProcessStripeWebhookUseCase(
      paymentRepository,
      subscriptionRepository,
      enrollmentRepository,
      stripeService
    );
  });

  return container;
}
