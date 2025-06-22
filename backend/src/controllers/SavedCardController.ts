import { FastifyRequest, FastifyReply } from 'fastify';
import { CreateSavedCardUseCase } from '../use-cases/CreateSavedCardUseCase';
import { GetUserSavedCardsUseCase } from '../use-cases/GetUserSavedCardsUseCase';
import { DeleteSavedCardUseCase } from '../use-cases/DeleteSavedCardUseCase';
import { SetDefaultSavedCardUseCase } from '../use-cases/SetDefaultSavedCardUseCase';

export class SavedCardController {
  constructor(
    private createSavedCardUseCase: CreateSavedCardUseCase,
    private getUserSavedCardsUseCase: GetUserSavedCardsUseCase,
    private deleteSavedCardUseCase: DeleteSavedCardUseCase,
    private setDefaultSavedCardUseCase: SetDefaultSavedCardUseCase
  ) {}

  async createSavedCard(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const {
        cardHolderName,
        cardNumber,
        expirationMonth,
        expirationYear,
        identificationType,
        identificationNumber,
        isDefault
      } = req.body as any;

      const userInfo = (req as any).userInfo;
      
      if (!userInfo) {
        reply.status(401).send({ 
          success: false, 
          error: 'Você precisa estar logado para salvar um cartão.' 
        });
        return;
      }

      const savedCard = await this.createSavedCardUseCase.execute({
        userId: userInfo.userId,
        cardHolderName,
        cardNumber,
        expirationMonth,
        expirationYear,
        identificationType,
        identificationNumber,
        isDefault
      });

      reply.status(201).send({
        success: true,
        data: savedCard
      });
    } catch (error) {
      console.error('Erro ao salvar cartão:', error);
      reply.status(400).send({
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  }

  async getUserSavedCards(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const userInfo = (req as any).userInfo;
      
      if (!userInfo) {
        reply.status(401).send({ 
          success: false, 
          error: 'Você precisa estar logado para ver seus cartões.' 
        });
        return;
      }

      const savedCards = await this.getUserSavedCardsUseCase.execute(userInfo.userId);

      reply.status(200).send({
        success: true,
        data: savedCards
      });
    } catch (error) {
      console.error('Erro ao buscar cartões salvos:', error);
      reply.status(400).send({
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  }

  async deleteSavedCard(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const { cardId } = req.params as any;
      const userInfo = (req as any).userInfo;
      
      if (!userInfo) {
        reply.status(401).send({ 
          success: false, 
          error: 'Você precisa estar logado para deletar um cartão.' 
        });
        return;
      }

      await this.deleteSavedCardUseCase.execute(userInfo.userId, cardId);

      reply.status(200).send({
        success: true,
        message: 'Cartão deletado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao deletar cartão:', error);
      reply.status(400).send({
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  }

  async setDefaultSavedCard(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const { cardId } = req.params as any;
      const userInfo = (req as any).userInfo;
      
      if (!userInfo) {
        reply.status(401).send({ 
          success: false, 
          error: 'Você precisa estar logado para alterar o cartão padrão.' 
        });
        return;
      }

      const updatedCard = await this.setDefaultSavedCardUseCase.execute(userInfo.userId, cardId);

      reply.status(200).send({
        success: true,
        data: updatedCard,
        message: 'Cartão definido como padrão'
      });
    } catch (error) {
      console.error('Erro ao definir cartão padrão:', error);
      reply.status(400).send({
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  }
}
