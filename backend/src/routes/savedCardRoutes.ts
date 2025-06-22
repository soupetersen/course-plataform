import { FastifyInstance } from 'fastify';
import { SavedCardController } from '@/controllers/SavedCardController';
import { AuthMiddleware } from '@/middlewares/AuthMiddleware';
import { DIContainer } from '@/shared/utils/DIContainer';
import { CreateSavedCardUseCase } from '@/use-cases/CreateSavedCardUseCase';
import { GetUserSavedCardsUseCase } from '@/use-cases/GetUserSavedCardsUseCase';
import { DeleteSavedCardUseCase } from '@/use-cases/DeleteSavedCardUseCase';
import { SetDefaultSavedCardUseCase } from '@/use-cases/SetDefaultSavedCardUseCase';
import { SavedCardRepository } from '@/interfaces/SavedCardRepository';
import { UserRepository } from '@/interfaces/UserRepository';

export async function savedCardRoutes(fastify: FastifyInstance) {
  const container = (fastify as any).diContainer as DIContainer;
  const authMiddleware = new AuthMiddleware();

  // Resolver dependências
  const savedCardRepository = container.resolve<SavedCardRepository>('SavedCardRepository');
  const userRepository = container.resolve<UserRepository>('UserRepository');

  // Criar use cases
  const createSavedCardUseCase = new CreateSavedCardUseCase(savedCardRepository, userRepository);
  const getUserSavedCardsUseCase = new GetUserSavedCardsUseCase(savedCardRepository, userRepository);
  const deleteSavedCardUseCase = new DeleteSavedCardUseCase(savedCardRepository, userRepository);
  const setDefaultSavedCardUseCase = new SetDefaultSavedCardUseCase(savedCardRepository, userRepository);

  // Criar controller
  const savedCardController = new SavedCardController(
    createSavedCardUseCase,
    getUserSavedCardsUseCase,
    deleteSavedCardUseCase,
    setDefaultSavedCardUseCase
  );

  // Criar cartão salvo
  fastify.post('/api/saved-cards', {
    preHandler: [authMiddleware.authenticate.bind(authMiddleware)]
  }, async (req, reply) => {
    return savedCardController.createSavedCard(req, reply);
  });

  // Buscar cartões salvos do usuário
  fastify.get('/api/saved-cards', {
    preHandler: [authMiddleware.authenticate.bind(authMiddleware)]
  }, async (req, reply) => {
    return savedCardController.getUserSavedCards(req, reply);
  });

  // Deletar cartão salvo
  fastify.delete('/api/saved-cards/:cardId', {
    preHandler: [authMiddleware.authenticate.bind(authMiddleware)]
  }, async (req, reply) => {
    return savedCardController.deleteSavedCard(req, reply);
  });

  // Definir cartão como padrão
  fastify.patch('/api/saved-cards/:cardId/default', {
    preHandler: [authMiddleware.authenticate.bind(authMiddleware)]
  }, async (req, reply) => {
    return savedCardController.setDefaultSavedCard(req, reply);
  });
}
