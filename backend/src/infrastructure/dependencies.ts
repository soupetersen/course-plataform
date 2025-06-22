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
import { ReviewRepository } from '@/interfaces/ReviewRepository';

import { CouponRepository } from '@/domain/repositories/CouponRepository';
import { CouponUsageRepository } from '@/domain/repositories/CouponUsageRepository';
import { PlatformSettingRepository } from '@/domain/repositories/PlatformSettingRepository';
import { RefundRequestRepository } from '@/domain/repositories/RefundRequestRepository';

import { PrismaUserRepository } from '@/repositories/PrismaUserRepository';
import { PrismaCourseRepository } from '@/repositories/PrismaCourseRepository';
import { PrismaModuleRepository } from '@/repositories/PrismaModuleRepository';
import { PrismaLessonRepository } from '@/repositories/PrismaLessonRepository';
import { PrismaLessonCommentRepository } from '@/repositories/PrismaLessonCommentRepository';
import { PrismaEnrollmentRepository } from '@/repositories/PrismaEnrollmentRepository';
import { PrismaPaymentRepository } from '@/repositories/PrismaPaymentRepository';
import { PrismaSubscriptionRepository } from '@/repositories/PrismaSubscriptionRepository';
import { PrismaCategoryRepository } from '@/repositories/PrismaCategoryRepository';
import { PrismaReviewRepository } from '@/repositories/PrismaReviewRepository';

import { PrismaCouponRepository } from '@/infrastructure/repositories/PrismaCouponRepository';
import { PrismaCouponUsageRepository } from '@/infrastructure/repositories/PrismaCouponUsageRepository';
import { PrismaPlatformSettingRepository } from '@/infrastructure/repositories/PrismaPlatformSettingRepository';
import { PrismaRefundRequestRepository } from '@/infrastructure/repositories/PrismaRefundRequestRepository';

import { CreateUserUseCase } from '@/use-cases/CreateUserUseCase';
import { AuthenticateUserUseCase } from '@/use-cases/AuthenticateUserUseCase';
import { CreateCourseUseCase } from '@/use-cases/CreateCourseUseCase';
import { CreateModuleUseCase } from '@/use-cases/CreateModuleUseCase';
import { CreateLessonUseCase } from '@/use-cases/CreateLessonUseCase';
import { CompleteLessonUseCase } from '@/use-cases/CompleteLessonUseCase';
import { EnrollInCourseUseCase } from '@/use-cases/EnrollInCourseUseCase';
import { CreateOneTimePaymentUseCase } from '@/use-cases/CreateOneTimePaymentUseCase';
import { CreateSubscriptionPaymentUseCase } from '@/use-cases/CreateSubscriptionPaymentUseCase';
import { CreateReviewUseCase } from '@/use-cases/CreateReviewUseCase';

import { ValidateCouponUseCase } from '@/use-cases/ValidateCouponUseCase';
import { ApplyCouponUseCase } from '@/use-cases/ApplyCouponUseCase';
import { CalculateFeesUseCase } from '@/use-cases/CalculateFeesUseCase';
import { CreateRefundRequestUseCase } from '@/use-cases/CreateRefundRequestUseCase';
import { ManageCouponsUseCase } from '@/use-cases/ManageCouponsUseCase';

import { JwtService } from '@/services/JwtService';
import { PasswordService } from '@/services/PasswordService';
import { PaymentGatewayFactory } from '@/services/PaymentGatewayFactory';
import { S3Service } from '@/services/S3Service';

export function setupDependencies(): DIContainer {
  const container = new DIContainer();

  container.registerSingleton('PrismaClient', () => new PrismaClient());

  container.registerSingleton('JwtService', () => new JwtService());
  container.registerSingleton('PasswordService', () => new PasswordService());
  container.registerSingleton('PaymentGatewayFactory', () => PaymentGatewayFactory.getInstance());
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
  container.registerSingleton('ReviewRepository', () => {
    const prisma = container.resolve<PrismaClient>('PrismaClient');
    return new PrismaReviewRepository(prisma);
  });

  container.registerSingleton('CouponRepository', () => {
    const prisma = container.resolve<PrismaClient>('PrismaClient');
    return new PrismaCouponRepository(prisma);
  });

  container.registerSingleton('CouponUsageRepository', () => {
    const prisma = container.resolve<PrismaClient>('PrismaClient');
    return new PrismaCouponUsageRepository(prisma);
  });

  container.registerSingleton('PlatformSettingRepository', () => {
    const prisma = container.resolve<PrismaClient>('PrismaClient');
    return new PrismaPlatformSettingRepository(prisma);
  });

  container.registerSingleton('RefundRequestRepository', () => {
    const prisma = container.resolve<PrismaClient>('PrismaClient');
    return new PrismaRefundRequestRepository(prisma);
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
    const paymentGatewayFactory = container.resolve<PaymentGatewayFactory>('PaymentGatewayFactory');
    return new CreateOneTimePaymentUseCase(paymentRepository, courseRepository, userRepository, paymentGatewayFactory);
  });
  container.register('CreateSubscriptionPaymentUseCase', () => {
    const paymentRepository = container.resolve<PaymentRepository>('PaymentRepository');
    const subscriptionRepository = container.resolve<SubscriptionRepository>('SubscriptionRepository');
    const courseRepository = container.resolve<CourseRepository>('CourseRepository');
    const userRepository = container.resolve<UserRepository>('UserRepository');
    const paymentGatewayFactory = container.resolve<PaymentGatewayFactory>('PaymentGatewayFactory');
    return new CreateSubscriptionPaymentUseCase(
      paymentRepository,
      subscriptionRepository,
      courseRepository,
      userRepository,
      paymentGatewayFactory
    );  });
  
  container.register('CreateReviewUseCase', () => {
    const reviewRepository = container.resolve<ReviewRepository>('ReviewRepository');
    const enrollmentRepository = container.resolve<EnrollmentRepository>('EnrollmentRepository');
    return new CreateReviewUseCase(reviewRepository, enrollmentRepository);
  });

  container.register('ValidateCouponUseCase', () => {
    const couponRepository = container.resolve<CouponRepository>('CouponRepository');
    const couponUsageRepository = container.resolve<CouponUsageRepository>('CouponUsageRepository');
    return new ValidateCouponUseCase(couponRepository, couponUsageRepository);
  });
  container.register('ApplyCouponUseCase', () => {
    const couponRepository = container.resolve<CouponRepository>('CouponRepository');
    const couponUsageRepository = container.resolve<CouponUsageRepository>('CouponUsageRepository');
    return new ApplyCouponUseCase(couponRepository, couponUsageRepository);
  });

  container.register('CalculateFeesUseCase', () => {
    const platformSettingRepository = container.resolve<PlatformSettingRepository>('PlatformSettingRepository');
    return new CalculateFeesUseCase(platformSettingRepository);
  });

  container.register('CreateRefundRequestUseCase', () => {
    const refundRequestRepository = container.resolve<RefundRequestRepository>('RefundRequestRepository');
    const paymentRepository = container.resolve<PaymentRepository>('PaymentRepository');
    const platformSettingRepository = container.resolve<PlatformSettingRepository>('PlatformSettingRepository');
    return new CreateRefundRequestUseCase(refundRequestRepository, paymentRepository, platformSettingRepository);
  });  container.register('ManageCouponsUseCase', () => {
    const couponRepository = container.resolve<CouponRepository>('CouponRepository');
    return new ManageCouponsUseCase(couponRepository);
  });

  return container;
}
