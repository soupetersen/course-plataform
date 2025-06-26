import { FastifyRequest, FastifyReply } from 'fastify';
import { CreateQuestionDto, UpdateQuestionDto, CreateQuestionOptionDto } from '@/dtos/QuestionDto';
import { QuestionRepository } from '@/interfaces/QuestionRepository';
import { PrismaQuestionRepository } from '@/repositories/PrismaQuestionRepository';
import { PrismaClient } from '@prisma/client';

interface QuestionParams {
  id: string;
}

interface LessonParams {
  lessonId: string;
}

interface OptionParams {
  questionId: string;
  optionId: string;
}

export class QuestionController {
  private questionRepository: QuestionRepository;

  constructor() {
    const prisma = new PrismaClient();
    this.questionRepository = new PrismaQuestionRepository(prisma);
  }

  async createQuestion(
    request: FastifyRequest<{ Body: CreateQuestionDto & { lessonId: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { lessonId, question, explanation, order, points, options } = request.body;

      const newQuestion = await this.questionRepository.create({
        id: crypto.randomUUID(),
        lessonId,
        question,
        explanation,
        order: order || 0,
        points: points || 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const questionOptions = [];
      for (const optionData of options) {
        const option = await this.questionRepository.createOption({
          id: crypto.randomUUID(),
          questionId: newQuestion.id,
          text: optionData.text,
          isCorrect: optionData.isCorrect,
          order: optionData.order || 0,
          createdAt: new Date(),
        });
        questionOptions.push(option);
      }

      return reply.status(201).send({
        success: true,
        data: {
          ...newQuestion,
          options: questionOptions,
        },
        message: 'Pergunta criada com sucesso',
      });
    } catch (error) {
      console.error('Error creating question:', error);
      return reply.status(500).send({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }

  async getQuestionsByLesson(
    request: FastifyRequest<{ Params: LessonParams }>,
    reply: FastifyReply
  ) {
    try {
      const { lessonId } = request.params;
      
      const questions = await this.questionRepository.findByLessonId(lessonId);
      
      const questionsWithOptions = await Promise.all(
        questions.map(async (question) => {
          const options = await this.questionRepository.findOptionsByQuestionId(question.id);
          return {
            ...question,
            options,
          };
        })
      );

      return reply.status(200).send({
        success: true,
        data: questionsWithOptions,
      });
    } catch (error) {
      console.error('Error fetching questions:', error);
      return reply.status(500).send({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }

  async updateQuestion(
    request: FastifyRequest<{ Params: QuestionParams; Body: UpdateQuestionDto }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      const updateData = request.body;

      const updatedQuestion = await this.questionRepository.update(id, updateData);

      return reply.status(200).send({
        success: true,
        data: updatedQuestion,
        message: 'Pergunta atualizada com sucesso',
      });
    } catch (error) {
      console.error('Error updating question:', error);
      return reply.status(500).send({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }

  async deleteQuestion(
    request: FastifyRequest<{ Params: QuestionParams }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;

      await this.questionRepository.deleteOptionsByQuestionId(id);
      
      await this.questionRepository.delete(id);

      return reply.status(200).send({
        success: true,
        message: 'Pergunta deletada com sucesso',
      });
    } catch (error) {
      console.error('Error deleting question:', error);
      return reply.status(500).send({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }

  async updateQuestionOption(
    request: FastifyRequest<{ Params: OptionParams; Body: CreateQuestionOptionDto }>,
    reply: FastifyReply
  ) {
    try {
      const { optionId } = request.params;
      const updateData = request.body;

      const updatedOption = await this.questionRepository.updateOption(optionId, updateData);

      return reply.status(200).send({
        success: true,
        data: updatedOption,
        message: 'Opção atualizada com sucesso',
      });
    } catch (error) {
      console.error('Error updating option:', error);
      return reply.status(500).send({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }

  async deleteQuestionOption(
    request: FastifyRequest<{ Params: OptionParams }>,
    reply: FastifyReply
  ) {
    try {
      const { optionId } = request.params;

      await this.questionRepository.deleteOption(optionId);

      return reply.status(200).send({
        success: true,
        message: 'Opção deletada com sucesso',
      });
    } catch (error) {
      console.error('Error deleting option:', error);
      return reply.status(500).send({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }
}
